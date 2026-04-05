import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@auth/services/users.service';
import { UserDocument } from '@auth/schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@auth/dtos/create-user.dto';
import { AuthDto } from '@auth/dtos/auth.dto';
import { IAuthResponse } from '@auth/interfaces/auth-response.interface';
import { IOAuthProfile } from '@auth/interfaces/oauth-profile.interface';
import { Request, Response } from 'express';
import { EmailVerificationTokenService } from '@auth/services/email-verification-token.service';
import { PasswordResetTokenService } from '@auth/services/password-reset-token.service';
import { MailService } from '@auth/services/mail.service';
import { AuthUtils } from '@auth/utils/auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenService: EmailVerificationTokenService,
    private readonly resetTokenService: PasswordResetTokenService,
    private readonly mailService: MailService,
  ) {}

  async signUp(dto: CreateUserDto): Promise<{ message: string }> {
    const existingUser = await this.usersService.findUserByEmail(dto.email);

    if (existingUser?.isVerified) {
      throw new ConflictException('User with such email already in use');
    }

    let user: UserDocument;

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      user = await this.usersService.createUser({
        ...dto,
        password: hashedPassword,
      });
    } else {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      user = await this.usersService.updateUser(existingUser._id.toString(), {
        username: dto.username,
        password: hashedPassword,
        locale: dto.locale ?? existingUser.locale,
      });
    }

    const raw = await this.tokenService.createToken(user._id, user.email);
    await this.mailService.sendVerificationEmail(user.email, raw, user.locale);

    return { message: 'Check your email to confirm your account' };
  }

  async signIn(
    { email, password }: AuthDto,
    res: Response,
  ): Promise<{ userId: string }> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    if (!user.isVerified) {
      throw new HttpException(
        {
          statusCode: 403,
          error: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email first',
        },
        403,
      );
    }

    const id = user._id.toString();
    const tokens = await this.getTokens(id, user.username);
    await this.updateRefreshToken(id, tokens.refreshToken);
    AuthUtils.attachAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return { userId: id };
  }

  async signOut(userId: string): Promise<UserDocument> {
    return this.usersService.updateUser(userId, { refreshToken: null });
  }

  async refreshTokens(req: Request, userId: string): Promise<IAuthResponse> {
    const refreshToken = req['user']['refreshToken'];
    const user = await this.usersService.findUserById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(userId, user.username);
    await this.updateRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  async signInWithProvider(profile: IOAuthProfile, locale: string): Promise<IAuthResponse> {
    const { provider, providerId, email, username } = profile;

    const existingUser = await this.usersService.findUserByEmail(email);

    if (existingUser) {
      const hasPassword = !!existingUser.password;
      const hasThisProvider = existingUser.providers?.some(
        (p) => p.provider === provider && p.providerId === providerId,
      );

      if (hasPassword && !hasThisProvider) {
        throw new ForbiddenException('EMAIL_CONFLICT');
      }

      if (!existingUser.isVerified) {
        await Promise.all([
          this.usersService.updateUser(existingUser._id.toString(), {
            isVerified: true,
            verifiedAt: new Date(),
          }),
          this.tokenService.deleteTokensForUser(existingUser._id),
        ]);
      }

      const id = existingUser._id.toString();
      const tokens = await this.getTokens(id, existingUser.username);
      await this.updateRefreshToken(id, tokens.refreshToken);
      return tokens;
    }

    const newUser = await this.usersService.createUserFromProvider({
      username,
      email,
      locale,
      isVerified: true,
      verifiedAt: new Date(),
      providers: [{ provider, providerId, connectedAt: new Date() }],
    });

    const id = newUser._id.toString();
    const tokens = await this.getTokens(id, newUser.username);
    await this.updateRefreshToken(id, tokens.refreshToken);
    return tokens;
  }

  async verifyEmail(
    rawToken: string,
    res: Response,
  ): Promise<{ userId: string }> {
    let record: Awaited<ReturnType<typeof this.tokenService.consumeToken>>;

    try {
      record = await this.tokenService.consumeToken(rawToken);
    } catch (err) {
      if (err.message === 'EXPIRED_TOKEN') {
        throw new GoneException('Verification link has expired');
      }
      throw new BadRequestException('Invalid verification link');
    }

    const user = await this.usersService.updateUser(
      record.userId.toString(),
      { isVerified: true, verifiedAt: new Date() },
    );

    const tokens = await this.getTokens(user._id.toString(), user.username);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    AuthUtils.attachAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return { userId: user._id.toString() };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const genericResponse = {
      message:
        'If that email is registered and unverified, a new link has been sent',
    };

    const user = await this.usersService.findUserByEmail(email);

    if (!user || user.isVerified) {
      return genericResponse;
    }

    const raw = await this.tokenService.createToken(user._id, user.email);
    await this.mailService.sendVerificationEmail(user.email, raw, user.locale);

    return genericResponse;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const genericResponse = {
      message: 'If that email is registered, a password reset link has been sent',
    };

    const user = await this.usersService.findUserByEmail(email);

    // Don't reveal whether the user exists or has a password
    if (!user || !user.password) {
      return genericResponse;
    }

    const raw = await this.resetTokenService.createToken(user._id, user.email);
    await this.mailService.sendPasswordResetEmail(user.email, raw, user.locale);

    return genericResponse;
  }

  async resetPassword(
    rawToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    let record: Awaited<ReturnType<typeof this.resetTokenService.consumeToken>>;

    try {
      record = await this.resetTokenService.consumeToken(rawToken);
    } catch (err) {
      if (err.message === 'EXPIRED_TOKEN') {
        throw new GoneException('Password reset link has expired');
      }
      throw new BadRequestException('Invalid password reset link');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Clear refresh token to invalidate all existing sessions
    await this.usersService.updateUser(record.userId.toString(), {
      password: hashedPassword,
      refreshToken: null,
    });

    return { message: 'Password has been reset successfully' };
  }

  private async getTokens(
    userId: string,
    username: string,
  ): Promise<IAuthResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { userId, username },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { userId, username },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return { userId, username, accessToken, refreshToken };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateUser(userId, {
      refreshToken: hashedRefreshToken,
    });
  }
}

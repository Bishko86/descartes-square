import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@auth/services/users.service';
import { User, UserDocument } from '@auth/schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@auth/dtos/create-user.dto';
import { AuthDto } from '@auth/dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp({
    username,
    email,
    password,
    createdAt,
  }: CreateUserDto): Promise<User> {
    const existedUser = await this.usersService.findUserByEmail(email);

    if (existedUser) {
      throw new BadRequestException('User with such email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.usersService.createUser({
      username,
      email,
      createdAt,
      password: hashedPassword,
    });
  }

  async signIn({
    email,
    password,
  }: AuthDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const id = user._id.toString();
    const tokens = await this.getTokens(id, user.username);

    await this.updateRefreshToken(id, tokens.refreshToken);

    return tokens;
  }

  async signOut(userId: string): Promise<UserDocument> {
    return this.usersService.updateUser(userId, { refreshToken: null });
  }

  private async getTokens(
    userId: string,
    username: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
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

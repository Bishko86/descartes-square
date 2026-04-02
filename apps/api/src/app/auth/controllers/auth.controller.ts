import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from '@auth/guards/google-auth.guard';
import { AuthService } from '@auth/services/auth.service';
import { CreateUserDto } from '@auth/dtos/create-user.dto';
import { AuthDto } from '@auth/dtos/auth.dto';
import { IOAuthProfile } from '@auth/interfaces/oauth-profile.interface';
import { Request, Response } from 'express';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { RefreshTokenGuard } from '@auth/guards/refresh-token.guard';
import { AuthUtils } from '@auth/utils/auth.utils';
import { IAuthLogout } from '@shared/src';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ id: string }> {
    return this.authService.signUp(createUserDto);
  }

  @Post('login')
  async login(
    @Body() data: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    userId: string;
  }> {
    const { accessToken, refreshToken, userId } =
      await this.authService.signIn(data);
    AuthUtils.attachAuthCookies(res, accessToken, refreshToken);

    return { userId };
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthLogout> {
    const userId = req['user']['userId'];

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const user = await this.authService.signOut(userId);

    return { logout: true, userId: user.id };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin(): void {
    // Passport handles the redirect to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    try {
      const profile = req.user as IOAuthProfile;
      const { accessToken, refreshToken } =
        await this.authService.signInWithProvider(profile);
      AuthUtils.attachAuthCookies(res, accessToken, refreshToken);
      res.redirect(`${frontendUrl}/home`);
    } catch (err) {
      if (
        err instanceof ForbiddenException &&
        err.message === 'EMAIL_CONFLICT'
      ) {
        res.redirect(`${frontendUrl}/auth-error?code=EMAIL_CONFLICT`);
      } else {
        res.redirect(`${frontendUrl}/auth-error?code=UNKNOWN`);
      }
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    userId: string;
  }> {
    const userId = req['user']['userId'];

    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      req,
      userId,
    );
    AuthUtils.attachAuthCookies(res, accessToken, refreshToken);
    return { userId };
  }
}

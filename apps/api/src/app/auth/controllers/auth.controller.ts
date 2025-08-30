import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '@auth/services/auth.service';
import { CreateUserDto } from '@auth/dtos/create-user.dto';
import { AuthDto } from '@auth/dtos/auth.dto';
import { Request, Response } from 'express';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { RefreshTokenGuard } from '@auth/guards/refresh-token.guard';
import { AuthUtils } from '@auth/utils/auth.utils';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  ): Promise<{ logout: boolean; userId: string }> {
    const userId = req['user']['userId'];

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const user = await this.authService.signOut(userId);

    return { logout: true, userId: user.id };
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

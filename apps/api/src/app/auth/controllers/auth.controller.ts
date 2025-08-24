import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '@auth/services/auth.service';
import { User, UserDocument } from '@auth/schema/user.schema';
import { CreateUserDto } from '@auth/dtos/create-user.dto';
import { AuthDto } from '@auth/dtos/auth.dto';
import { Request } from 'express';
import { IAuthTokens } from '@auth/interfaces/auth-tokens.interface';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.signUp(createUserDto);
  }

  @Post('login')
  async login(@Body() data: AuthDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    return this.authService.signIn(data);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req: Request): Promise<UserDocument> {
    return this.authService.signOut(req['user']['userId']);
  }
}

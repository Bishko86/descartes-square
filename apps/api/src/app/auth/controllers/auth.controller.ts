import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '@auth/services/auth.service';
import { User } from '@auth/schema/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() user: User): Promise<User> {
    return this.authService.register(user);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ token: string }> {
    return this.authService.login(email, password);
  }
}

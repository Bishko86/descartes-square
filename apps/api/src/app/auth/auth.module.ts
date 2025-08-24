import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from '@auth/services/users.service';
import { UserController } from '@auth/controllers/user.controller';
import { User, UserSchema } from '@auth/schema/user.schema';
import { AuthController } from '@auth/controllers/auth.controller';
import { AuthService } from '@auth/services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from '@auth/strategies/access-token.strategy';
import { RefreshTokenStrategy } from '@auth/strategies/refresh-token.strategy';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({}),
  ],
  controllers: [UserController, AuthController],
  providers: [
    UsersService,
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AccessTokenGuard,
  ],
})
export class AuthModule {}

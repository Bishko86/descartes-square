import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersService } from '@auth/services/users.service';
import { UserController } from '@auth/controllers/user.controller';
import { User, UserSchema } from '@auth/schema/user.schema';
import { AuthController } from '@auth/controllers/auth.controller';
import { AuthService } from '@auth/services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from '@auth/strategies/access-token.strategy';
import { RefreshTokenStrategy } from '@auth/strategies/refresh-token.strategy';
import { GoogleStrategy } from '@auth/strategies/google.strategy';
import { AccessTokenGuard } from '@auth/guards/access-token.guard';
import { RefreshTokenGuard } from '@auth/guards/refresh-token.guard';
import {
  EmailVerificationToken,
  EmailVerificationTokenSchema,
} from '@auth/schema/email-verification-token.schema';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from '@auth/schema/password-reset-token.schema';
import { EmailVerificationTokenService } from '@auth/services/email-verification-token.service';
import { PasswordResetTokenService } from '@auth/services/password-reset-token.service';
import { MailService } from '@auth/services/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: EmailVerificationToken.name,
        schema: EmailVerificationTokenSchema,
      },
      {
        name: PasswordResetToken.name,
        schema: PasswordResetTokenSchema,
      },
    ]),
    JwtModule.register({}),
    PassportModule,
    // Rate-limits POST /auth/resend-verification to 3 requests per minute per IP
    // to prevent inbox flooding / email abuse.
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 3 }]),
  ],
  controllers: [UserController, AuthController],
  providers: [
    UsersService,
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
    EmailVerificationTokenService,
    PasswordResetTokenService,
    MailService,
  ],
  exports: [AccessTokenGuard],
})
export class AuthModule {}

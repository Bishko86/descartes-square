import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { IOAuthProfile } from '@auth/interfaces/oauth-profile.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL');
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL,
      scope: ['email', 'profile'],
    });
    this.logger.log(`Google OAuth callbackURL: "${callbackURL}"`);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<IOAuthProfile> {
    return {
      provider: 'google',
      providerId: profile.id,
      email: profile.emails[0].value,
      username: profile.displayName,
    };
  }
}

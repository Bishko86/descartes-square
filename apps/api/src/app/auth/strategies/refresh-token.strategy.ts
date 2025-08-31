import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: Record<string, unknown>) {
    const refreshToken =
      (req.cookies &&
        (req.cookies as Record<string, string>)['refreshToken']) ??
      null;

    if (!refreshToken) {
      // Throwing here signals an auth failure instead of letting a runtime TypeError happen
      throw new UnauthorizedException('Refresh token not found');
    }

    // payload should contain userId (depending on how you sign refresh JWT)
    return { userId: payload['userId'], refreshToken };
  }
}

function cookieExtractor(req: Request): string | null {
  if (req && req.cookies) {
    return req.cookies['refreshToken'];
  }
  return null;
}

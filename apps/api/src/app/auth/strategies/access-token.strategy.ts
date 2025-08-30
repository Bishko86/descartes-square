import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Maybe } from '@shared/src';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate<T extends { userId: string; email: string }>(payload: T) {
    return { userId: payload.userId, email: payload.email };
  }
}

function cookieExtractor(req: Request): Maybe<string> {
  if (req && req.cookies) {
    return req.cookies['accessToken'];
  }
  return null;
}

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

  async validate(payload: { userId: string; username: string }) {
    return { userId: payload.userId, username: payload.username };
  }
}

function cookieExtractor(req: Request): Maybe<string> {
  if (req && req.cookies) {
    return req.cookies['accessToken'];
  }
  return null;
}

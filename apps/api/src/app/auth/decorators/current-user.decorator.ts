import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/** Shape returned by AccessTokenStrategy.validate and attached to req.user. */
export interface ICurrentUser {
  userId: string;
  username: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ICurrentUser => {
    const user = ctx.switchToHttp().getRequest<Request>().user as
      | ICurrentUser
      | undefined;
    if (!user?.userId) {
      throw new UnauthorizedException();
    }
    return user;
  },
);

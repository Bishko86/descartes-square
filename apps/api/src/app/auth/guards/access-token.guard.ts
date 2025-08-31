import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  // Override handleRequest so we can return 403 when there's no access token at all.
  // If a token is present, delegate to the base AuthGuard to preserve the normal
  // behavior (expired/invalid tokens -> 401).
  handleRequest(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
  ) {
    const req = context.switchToHttp().getRequest<Request>();

    // Check for cookie-based access token
    const hasCookieToken = !!(req.cookies && req.cookies['accessToken']);

    if (!hasCookieToken) {
      // No token provided at all — treat as "logged out" and return 403
      throw new ForbiddenException('No access token provided');
    }

    return super.handleRequest(err, user, info, context);
  }
}

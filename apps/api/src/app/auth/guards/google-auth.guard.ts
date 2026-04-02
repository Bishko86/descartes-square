import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger(GoogleAuthGuard.name);

  handleRequest(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
  ) {
    if (err) {
      this.logger.error('Google OAuth error:', err);
      throw err;
    }
    if (!user) {
      this.logger.error('Google OAuth: no user returned. Info:', info);
    }
    return super.handleRequest(err, user, info, context);
  }
}

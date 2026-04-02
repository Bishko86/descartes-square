/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import 'dotenv';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4200';
  app.enableCors({ origin: corsOrigin, credentials: true });
  app.use(cookieParser());
  // Google OAuth requires a session to carry state between the two redirect legs:
  // GET /auth/google (redirect to Google) → GET /auth/google/callback (Google redirects back).
  // These are separate HTTP requests, so Passport uses the session to bridge them.
  // Once the callback issues JWT cookies, the session is never used again.
  // 60s maxAge is intentionally short — just enough to complete the OAuth round-trip.
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60_000 },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Identity serialize/deserialize — no DB lookup needed since the session is
  // only a temporary transport for the OAuth handshake, not a persistent auth mechanism.
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();

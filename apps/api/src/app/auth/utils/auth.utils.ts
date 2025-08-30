import { Response } from 'express';

export abstract class AuthUtils {
  public static attachAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie('accessToken', accessToken, {
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 min
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.DEV_MODE !== 'true',
      domain: '.localhost',
    });

    res.cookie('refreshToken', refreshToken, {
      path: '/',
      maxAge: 15 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.DEV_MODE !== 'true',
      domain: '.localhost',
    });
  }
}

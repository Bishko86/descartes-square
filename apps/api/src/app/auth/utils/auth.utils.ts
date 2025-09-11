import { Response } from 'express';

export abstract class AuthUtils {
  public static attachAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const cookieAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    res.cookie('accessToken', accessToken, {
      path: '/',
      maxAge: cookieAge,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.DEV_MODE !== 'true',
    });

    res.cookie('refreshToken', refreshToken, {
      path: '/api/auth/refresh',
      maxAge: cookieAge,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.DEV_MODE !== 'true',
    });
  }
}

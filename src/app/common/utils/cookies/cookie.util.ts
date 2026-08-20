import { Response, Request, CookieOptions } from 'express';

export class CookieUtil {
  private static defaultOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax',
    path: '/',
  };

  static set(
    res: Response,
    name: string,
    value: string,
    options: Partial<CookieOptions> = {},
  ): void {
    res.cookie(name, value, {
      ...this.defaultOptions,
      ...options,
    });
  }

  static get(req: Request, name: string): string | undefined {
    return req.cookies?.[name] || req.signedCookies?.[name];
  }

  static clear(
    res: Response,
    name: string,
    options: Partial<CookieOptions> = {},
  ): void {
    res.clearCookie(name, {
      ...this.defaultOptions,
      ...options,
    });
  }
}

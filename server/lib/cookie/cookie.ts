import { CookieOptions } from 'express';

export const cookieOption: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 100 * 365 * 24 * 60 * 60 * 1000, // 100 years
};

export const adminCookieName = 'quickship_admin_token';
export const userCookieName = 'quickship_user_token';
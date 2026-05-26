import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/login', '/register'];

export function proxy(req: NextRequest) {
  const token = req.cookies.get('auth_token');
  const isAuthRoute = AUTH_ROUTES.some((r) => req.nextUrl.pathname.startsWith(r));

  if (!token && !isAuthRoute) {
    // auth_expires_at present means this was an active session that expired —
    // let the app load so the session-expired modal can handle re-auth in place.
    if (req.cookies.get('auth_expires_at')) return;
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token && isAuthRoute) return NextResponse.redirect(new URL('/', req.url));
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};

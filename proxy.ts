import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/login', '/register'];

export function proxy(req: NextRequest) {
  const token = req.cookies.get('auth_token');
  const isAuthRoute = AUTH_ROUTES.some(r => req.nextUrl.pathname.startsWith(r));

  if (!token && !isAuthRoute)
    return NextResponse.redirect(new URL('/login', req.url));
  if (token && isAuthRoute)
    return NextResponse.redirect(new URL('/', req.url));
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};

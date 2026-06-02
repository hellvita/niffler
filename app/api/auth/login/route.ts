import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { AUTH_COOKIE_MAX_AGE_MS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${env.INTERNAL_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) return NextResponse.json(await res.json(), { status: res.status });

  const { token, expiresAt } = await res.json();
  const cookieStore = await cookies();
  const longLived = new Date(Date.now() + AUTH_COOKIE_MAX_AGE_MS);

  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(expiresAt),
    path: '/',
  });

  // Non-httpOnly cookies readable by client JS — use long-lived expiry so they
  // survive the JWT expiry and are available in the session-expired modal.
  cookieStore.set('user_email', body.email, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: longLived,
    path: '/',
  });

  cookieStore.set('auth_expires_at', expiresAt, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: longLived,
    path: '/',
  });

  return NextResponse.json({ expiresAt });
}

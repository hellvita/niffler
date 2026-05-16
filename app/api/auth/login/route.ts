import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${process.env.INTERNAL_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) return NextResponse.json(await res.json(), { status: res.status });

  const { token, expiresAt } = await res.json();
  const cookieStore = await cookies();

  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(expiresAt),
    path: '/',
  });

  // Non-httpOnly: readable by client JS for the session-expired modal
  cookieStore.set('user_email', body.email, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(expiresAt),
    path: '/',
  });

  return NextResponse.json({ expiresAt });
}

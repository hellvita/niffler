import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (token) {
    // Revoke the token server-side; ignore errors (already expired/revoked)
    await fetch(`${process.env.INTERNAL_API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  cookieStore.delete('auth_token');
  cookieStore.delete('user_email');
  cookieStore.delete('auth_expires_at');

  return NextResponse.json({ ok: true });
}

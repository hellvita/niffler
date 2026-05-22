export async function login(email: string, password: string): Promise<{ expiresAt: string }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok)
    throw Object.assign(new Error(`${res.status}`), { status: res.status, data: await res.json() });
  return res.json();
}

export async function register(email: string, password: string): Promise<{ expiresAt: string }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok)
    throw Object.assign(new Error(`${res.status}`), { status: res.status, data: await res.json() });
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

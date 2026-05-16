const BASE = '/api/proxy';

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw Object.assign(new Error(`${res.status}`), { status: res.status });
  return res.json();
}

export async function apiMutate<T>(
  method: 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T | null> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw Object.assign(new Error(`${res.status}`), { status: res.status });
  if (res.status === 204) return null;
  return res.json();
}

export async function deleteAccount(): Promise<void> {
  const res = await fetch('/api/auth/delete-account', { method: 'POST' });
  if (!res.ok) throw Object.assign(new Error(`${res.status}`), { status: res.status });
}

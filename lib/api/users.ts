import { ApiError } from './errors';

export async function deleteAccount(): Promise<void> {
  const res = await fetch('/api/auth/delete-account', { method: 'POST' });
  if (!res.ok) throw new ApiError(res.status);
}

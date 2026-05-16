'use client';
import { useState } from 'react';
import { useSessionExpired } from './SessionExpiredContext';

function getEmailFromCookie(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.split('; ').find(r => r.startsWith('user_email='));
  return match ? decodeURIComponent(match.split('=')[1]) : '';
}

export function SessionExpiredModal() {
  const { isExpired, clearExpired } = useSessionExpired();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  if (!isExpired) return null;

  const email = getEmailFromCookie();

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError('Incorrect password. Please try again.');
        return;
      }
      clearExpired();
      setPassword('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsPending(false);
    }
  }

  async function handleSignInDifferent() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-1">Session expired</h2>
        <p className="text-sm text-gray-500 mb-4">
          Re-enter your password to continue as <strong>{email}</strong>.
        </p>
        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <label
              htmlFor="session-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="session-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isPending}
              autoFocus
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isPending || !password}
            className="w-full bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Signing in…' : 'Continue'}
          </button>
        </form>
        <button
          onClick={handleSignInDifferent}
          className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700 text-center"
        >
          Sign in as a different account
        </button>
      </div>
    </div>
  );
}

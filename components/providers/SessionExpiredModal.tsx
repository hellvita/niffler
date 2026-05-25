'use client';
import { useState } from 'react';
import { useSessionExpired } from './SessionExpiredContext';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';

function getEmailFromCookie(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.split('; ').find((r) => r.startsWith('user_email='));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-backdrop)]">
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl p-8 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-1 text-[var(--color-text-primary)]">
          Session expired
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Re-enter your password to continue as <strong>{email}</strong>.
        </p>
        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <label
              htmlFor="session-password"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
            >
              Password
            </label>
            <Input
              id="session-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
          <Button type="submit" disabled={isPending || !password} className="w-full">
            {isPending ? 'Signing in…' : 'Continue'}
          </Button>
        </form>
        <button
          onClick={handleSignInDifferent}
          className="mt-4 w-full text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-center transition-colors"
        >
          Sign in as a different account
        </button>
      </div>
    </div>
  );
}

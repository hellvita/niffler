'use client';
import { useState } from 'react';
import { useSessionExpired } from './SessionExpiredContext';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Modal } from '@/components/shared/Modal';

export function SessionExpiredModal({ email }: { email: string | null }) {
  const { isExpired, clearExpired } = useSessionExpired();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email ?? '', password }),
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
    // Deliberate hard navigation, not a client-side router.push(). The QueryClient is held in
    // useState by QueryProvider, which sits above the routes and so is NOT unmounted by a
    // client-side navigation — the outgoing user's cached expense and summary data would
    // survive into the next session. A full document load is what guarantees the clean slate.
    // (@next/next/no-location-assign-relative-destination, added in eslint-config-next 16.3.x,
    // suggests router.push() here; that suggestion is unsafe for logout specifically.)
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/login';
  }

  return (
    <Modal open={isExpired} onClose={() => {}} title="Session expired" maxWidth="sm" preventClose>
      <div className="px-6 pb-6 pt-4">
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
        <Button variant="text" className="w-full text-center mt-4" onClick={handleSignInDifferent}>
          Sign in as a different account
        </Button>
      </div>
    </Modal>
  );
}

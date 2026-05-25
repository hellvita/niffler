'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { useAllTimeSummary } from '@/lib/hooks/useSummary';
import { useLogout } from '@/lib/hooks/useAuth';
import { AboutModal } from './AboutModal';

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]'
          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-btn-secondary-hover)]'
      }`}
    >
      {children}
    </Link>
  );
}

function BalanceDisplay() {
  const { data } = useAllTimeSummary();
  if (data === undefined) return null;
  return (
    <span
      className={`text-sm font-semibold tabular-nums font-mono whitespace-nowrap ${
        data.currentBalance < 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-text-primary)]'
      }`}
    >
      {data.currentBalance.toFixed(2)}
    </span>
  );
}

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();
  const [showAbout, setShowAbout] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const currentMonth = format(new Date(), 'yyyy-MM');

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push('/login'),
    });
  };

  return (
    <>
      <nav className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center gap-2 overflow-x-auto">
          <Link
            href="/"
            className="mr-2 text-base font-bold text-[var(--color-text-primary)] tracking-tight shrink-0"
          >
            Niffler
          </Link>

          <NavLink href={`/day/${today}`} active={pathname.startsWith('/day/')}>
            Today
          </NavLink>
          <NavLink href={`/month/${currentMonth}`} active={pathname.startsWith('/month/')}>
            Month
          </NavLink>
          <NavLink href="/analytics" active={pathname.startsWith('/analytics')}>
            Analytics
          </NavLink>
          <NavLink href="/import" active={pathname.startsWith('/import')}>
            Import
          </NavLink>
          <NavLink href="/settings" active={pathname.startsWith('/settings')}>
            Settings
          </NavLink>
          <button
            onClick={() => setShowAbout(true)}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-btn-secondary-hover)] transition-colors shrink-0"
            aria-label="About Niffler"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>

          <div className="flex-1" />

          <span className="text-xs text-[var(--color-text-muted)] shrink-0">Balance</span>
          <BalanceDisplay />

          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="ml-2 px-3 py-1.5 text-sm rounded-lg border border-[var(--color-btn-secondary-border)] text-[var(--color-btn-secondary-text)] hover:bg-[var(--color-btn-secondary-hover)] disabled:opacity-40 transition-colors shrink-0"
          >
            {logout.isPending ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      </nav>
      <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}

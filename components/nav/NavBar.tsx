'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { useAllTimeSummary } from '@/lib/hooks/useSummary';
import { useLogout } from '@/lib/hooks/useAuth';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { Button } from '@/components/shared/Button';
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
  const { email } = useCurrentUser();
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
      <nav
        aria-label="Main"
        className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center gap-2 overflow-x-auto">
          <Link
            href="/"
            className="mr-2 text-base font-bold text-[var(--color-text-primary)] tracking-tight shrink-0"
          >
            Niffler
          </Link>

          <ul className="flex items-center gap-1 list-none">
            <li>
              <NavLink href={`/day/${today}`} active={pathname.startsWith('/day/')}>
                Today
              </NavLink>
            </li>
            <li>
              <NavLink href={`/month/${currentMonth}`} active={pathname.startsWith('/month/')}>
                Month
              </NavLink>
            </li>
            <li>
              <NavLink href="/analytics" active={pathname.startsWith('/analytics')}>
                Analytics
              </NavLink>
            </li>
            <li>
              <NavLink href="/import" active={pathname.startsWith('/import')}>
                Import
              </NavLink>
            </li>
            <li>
              <NavLink href="/settings" active={pathname.startsWith('/settings')}>
                Settings
              </NavLink>
            </li>
          </ul>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowAbout(true)}
            aria-label="About Niffler"
            className="shrink-0"
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
          </Button>

          <div className="flex-1" />

          <span className="text-xs text-[var(--color-text-muted)] shrink-0">Balance</span>
          <BalanceDisplay />

          {email && (
            <span
              title={email}
              className="text-xs text-[var(--color-text-muted)] truncate max-w-[12rem] shrink-0 ml-2"
            >
              {email}
            </span>
          )}

          <Button
            variant="secondary"
            size="sm"
            loading={logout.isPending}
            onClick={handleLogout}
            className="ml-2 shrink-0"
          >
            Logout
          </Button>
        </div>
      </nav>
      <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}

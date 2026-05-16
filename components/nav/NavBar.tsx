'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { useAllTimeSummary } from '@/lib/hooks/useSummary';
import { useLogout } from '@/lib/hooks/useAuth';

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800'
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
    <span className={`text-sm font-semibold tabular-nums font-mono whitespace-nowrap ${
      data.currentBalance < 0 ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'
    }`}>
      {data.currentBalance.toFixed(2)}
    </span>
  );
}

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();

  const today = format(new Date(), 'yyyy-MM-dd');
  const currentMonth = format(new Date(), 'yyyy-MM');

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push('/login'),
    });
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 h-12 flex items-center gap-2 overflow-x-auto">
        {/* Wordmark */}
        <Link
          href="/"
          className="mr-2 text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight shrink-0"
        >
          Niffler
        </Link>

        {/* Navigation links */}
        <NavLink href={`/day/${today}`} active={pathname.startsWith('/day/')}>
          Today
        </NavLink>
        <NavLink href={`/month/${currentMonth}`} active={pathname.startsWith('/month/')}>
          Month
        </NavLink>
        <NavLink href="/analytics" active={pathname.startsWith('/analytics')}>
          Analytics
        </NavLink>
        <NavLink href="/settings" active={pathname.startsWith('/settings')}>
          Settings
        </NavLink>
        <NavLink href="/import" active={pathname.startsWith('/import')}>
          Import
        </NavLink>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Balance */}
        <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">Balance</span>
        <BalanceDisplay />

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className="ml-2 px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors shrink-0"
        >
          {logout.isPending ? 'Logging out…' : 'Logout'}
        </button>
      </div>
    </nav>
  );
}

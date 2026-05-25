'use client';
import { useRouter } from 'next/navigation';
import { format, addMonths, subMonths, parseISO } from 'date-fns';

export function MonthNavigator({ yearMonth }: { yearMonth: string }) {
  const router = useRouter();
  const parsed = parseISO(`${yearMonth}-01`);

  const navigate = (d: Date) => router.push(`/month/${format(d, 'yyyy-MM')}`);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate(subMonths(parsed, 1))}
        aria-label="Previous month"
        className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
        ←
      </button>

      <h1 className="flex-1 text-center text-base font-semibold text-[var(--color-text-primary)]">
        {format(parsed, 'MMMM yyyy')}
      </h1>

      <button
        onClick={() => navigate(addMonths(parsed, 1))}
        aria-label="Next month"
        className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
        →
      </button>

      <button
        onClick={() => navigate(new Date())}
        className="px-3 py-1 text-sm rounded-lg border border-[var(--color-btn-secondary-border)] text-[var(--color-btn-secondary-text)] hover:bg-[var(--color-btn-secondary-hover)] transition-colors"
      >
        This month
      </button>
    </div>
  );
}

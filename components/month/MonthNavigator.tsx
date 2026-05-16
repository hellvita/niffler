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
        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        ←
      </button>

      <h1 className="flex-1 text-center text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {format(parsed, 'MMMM yyyy')}
      </h1>

      <button
        onClick={() => navigate(addMonths(parsed, 1))}
        aria-label="Next month"
        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        →
      </button>

      <button
        onClick={() => navigate(new Date())}
        className="px-3 py-1 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        This month
      </button>
    </div>
  );
}

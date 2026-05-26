'use client';
import { useRouter } from 'next/navigation';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { Button } from '@/components/shared/Button';

export function MonthNavigator({ yearMonth }: { yearMonth: string }) {
  const router = useRouter();
  const parsed = parseISO(`${yearMonth}-01`);

  const navigate = (d: Date) => router.push(`/month/${format(d, 'yyyy-MM')}`);

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(subMonths(parsed, 1))}
        aria-label="Previous month"
      >
        ←
      </Button>

      <h1 className="flex-1 text-center text-base font-semibold text-[var(--color-text-primary)]">
        {format(parsed, 'MMMM yyyy')}
      </h1>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(addMonths(parsed, 1))}
        aria-label="Next month"
      >
        →
      </Button>

      <Button variant="secondary" size="sm" onClick={() => navigate(new Date())}>
        This month
      </Button>
    </div>
  );
}

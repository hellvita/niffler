'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, subDays, parseISO } from 'date-fns';

export function DateNavigator({ date }: { date: string }) {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const parsed = parseISO(date);

  const navigate = (d: Date) => router.push(`/day/${format(d, 'yyyy-MM-dd')}`);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate(subDays(parsed, 1))}
        aria-label="Previous day"
        className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
        ←
      </button>

      <div className="relative flex-1 text-center">
        <button
          onClick={() => setShowPicker((v) => !v)}
          className="text-base font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          {format(parsed, 'EEEE, MMMM d, yyyy')}
        </button>
        {showPicker && (
          <input
            type="date"
            value={date}
            onChange={(e) => {
              if (e.target.value) {
                navigate(parseISO(e.target.value));
                setShowPicker(false);
              }
            }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10 rounded border border-[var(--color-btn-secondary-border)] px-2 py-1 text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] shadow-md"
          />
        )}
      </div>

      <button
        onClick={() => navigate(addDays(parsed, 1))}
        aria-label="Next day"
        className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
        →
      </button>

      <button
        onClick={() => navigate(new Date())}
        className="px-3 py-1 text-sm rounded-lg border border-[var(--color-btn-secondary-border)] text-[var(--color-btn-secondary-text)] hover:bg-[var(--color-btn-secondary-hover)] transition-colors"
      >
        Today
      </button>
    </div>
  );
}

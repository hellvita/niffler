'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, subDays, parseISO } from 'date-fns';

export function DateNavigator({ date }: { date: string }) {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const parsed = parseISO(date);

  const navigate = (d: Date) =>
    router.push(`/day/${format(d, 'yyyy-MM-dd')}`);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate(subDays(parsed, 1))}
        aria-label="Previous day"
        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
      >
        ←
      </button>

      <div className="relative flex-1 text-center">
        <button
          onClick={() => setShowPicker(v => !v)}
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
        >
          {format(parsed, 'EEEE, MMMM d, yyyy')}
        </button>
        {showPicker && (
          <input
            type="date"
            value={date}
            onChange={e => {
              if (e.target.value) {
                navigate(parseISO(e.target.value));
                setShowPicker(false);
              }
            }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10 rounded border border-zinc-300 dark:border-zinc-600 px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 shadow-md"
          />
        )}
      </div>

      <button
        onClick={() => navigate(addDays(parsed, 1))}
        aria-label="Next day"
        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
      >
        →
      </button>

      <button
        onClick={() => navigate(new Date())}
        className="px-3 py-1 text-sm rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-50 transition-colors"
      >
        Today
      </button>
    </div>
  );
}

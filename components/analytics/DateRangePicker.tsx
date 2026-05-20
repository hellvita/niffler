'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';

type Preset = 'this-week' | 'this-month' | 'last-3-months' | 'this-year' | 'all-time';

function presetDates(preset: Preset): { from: string; to: string } | null {
  const today = new Date();
  switch (preset) {
    case 'this-week':
      return {
        from: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        to: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      };
    case 'this-month':
      return {
        from: format(startOfMonth(today), 'yyyy-MM-dd'),
        to: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    case 'last-3-months':
      return {
        from: format(startOfMonth(subMonths(today, 2)), 'yyyy-MM-dd'),
        to: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    case 'this-year':
      return {
        from: format(startOfYear(today), 'yyyy-MM-dd'),
        to: format(endOfYear(today), 'yyyy-MM-dd'),
      };
    case 'all-time':
      return null;
  }
}

const PRESETS: { key: Preset; label: string }[] = [
  { key: 'this-week', label: 'This week' },
  { key: 'this-month', label: 'This month' },
  { key: 'last-3-months', label: 'Last 3 months' },
  { key: 'this-year', label: 'This year' },
  { key: 'all-time', label: 'All time' },
];

export function DateRangePicker({
  from,
  to,
  preset,
}: {
  from: string;
  to: string;
  preset: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) p.delete(k);
      else p.set(k, v);
    }
    router.push(`${pathname}?${p.toString()}`);
  };

  const applyPreset = (key: Preset) => {
    if (key === 'all-time') {
      updateParams({ preset: 'all-time', from: null, to: null });
    } else {
      const dates = presetDates(key)!;
      updateParams({ from: dates.from, to: dates.to, preset: key });
    }
  };

  const isAllTime = preset === 'all-time';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(p => (
          <button
            key={p.key}
            onClick={() => applyPreset(p.key)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              p.key === preset
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                : 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {!isAllTime && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={e => updateParams({ from: e.target.value, preset: null })}
            className="text-sm px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
          <span className="text-zinc-400 dark:text-zinc-500">–</span>
          <input
            type="date"
            value={to}
            min={from}
            onChange={e => updateParams({ to: e.target.value, preset: null })}
            className="text-sm px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      )}
    </div>
  );
}

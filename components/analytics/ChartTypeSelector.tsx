'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type ChartType = 'pie' | 'bar' | 'line';

const OPTIONS: { type: ChartType; label: string }[] = [
  { type: 'pie', label: 'Pie' },
  { type: 'bar', label: 'Bar' },
  { type: 'line', label: 'Line' },
];

export function ChartTypeSelector({ value }: { value: ChartType }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const set = (type: ChartType) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('chart', type);
    router.push(`${pathname}?${p.toString()}`);
  };

  return (
    <div className="flex gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
      {OPTIONS.map(o => (
        <button
          key={o.type}
          onClick={() => set(o.type)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === o.type
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

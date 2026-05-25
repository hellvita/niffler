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
    <div className="flex gap-1 p-1 rounded-lg bg-[var(--color-bg-secondary)]">
      {OPTIONS.map((o) => (
        <button
          key={o.type}
          onClick={() => set(o.type)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === o.type
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

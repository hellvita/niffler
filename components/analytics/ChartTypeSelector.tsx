'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/shared/Button';

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
        <Button
          key={o.type}
          variant={value === o.type ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => set(o.type)}
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}

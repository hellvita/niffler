'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { Button } from './Button';
import { Input } from './Input';

export function DateNavigator({ date }: { date: string }) {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const parsed = parseISO(date);

  const navigate = (d: Date) => router.push(`/day/${format(d, 'yyyy-MM-dd')}`);

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(subDays(parsed, 1))}
        aria-label="Previous day"
      >
        ←
      </Button>

      <div className="relative flex-1 text-center">
        <button
          onClick={() => setShowPicker((v) => !v)}
          className="text-base font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          {format(parsed, 'EEEE, MMMM d, yyyy')}
        </button>
        {showPicker && (
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              if (e.target.value) {
                navigate(parseISO(e.target.value));
                setShowPicker(false);
              }
            }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10 w-auto shadow-md"
          />
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(addDays(parsed, 1))}
        aria-label="Next day"
      >
        →
      </Button>

      <Button variant="secondary" size="sm" onClick={() => navigate(new Date())}>
        Today
      </Button>
    </div>
  );
}

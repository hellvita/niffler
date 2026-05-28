'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { Button } from './Button';
import { DateInput } from './DateInput';

export function DateNavigator({ date }: { date: string }) {
  const router = useRouter();
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const parsed = parseISO(date);

  const navigate = (d: Date) => router.push(`/day/${format(d, 'yyyy-MM-dd')}`);

  useEffect(() => {
    if (!showPicker) return;
    const el = inputRef.current;
    if (!el) return;
    const handleChange = () => {
      if (el.value) {
        router.push(`/day/${el.value}`);
        setShowPicker(false);
      }
    };
    el.addEventListener('change', handleChange);
    return () => el.removeEventListener('change', handleChange);
  }, [showPicker, router]);

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
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10 w-fit shadow-md">
            <DateInput
              ref={inputRef}
              key={date}
              defaultValue={date}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  router.push(`/day/${e.currentTarget.value}`);
                  setShowPicker(false);
                }
                if (e.key === 'Escape') setShowPicker(false);
              }}
              onBlur={() => setShowPicker(false)}
            />
          </div>
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

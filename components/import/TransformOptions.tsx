'use client';
import { useState } from 'react';
import { Input } from '@/components/shared/Input';

interface Props {
  scaleFactor: number;
  invertSign: boolean;
  onScaleChange: (v: number) => void;
  onInvertChange: (v: boolean) => void;
}

export function TransformOptions({
  scaleFactor,
  invertSign,
  onScaleChange,
  onInvertChange,
}: Props) {
  const [scaleStr, setScaleStr] = useState(String(scaleFactor));

  const handleScaleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScaleStr(e.target.value);
    const num = parseFloat(e.target.value);
    if (!isNaN(num) && num > 0) onScaleChange(num);
  };

  const showExample = scaleFactor !== 1 && !isNaN(scaleFactor) && scaleFactor > 0;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]">
      <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
        Value transformation (optional)
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-[var(--color-text-primary)]">Scale factor</label>
        <Input
          type="number"
          step="any"
          min="0"
          value={scaleStr}
          onChange={handleScaleInput}
          className="w-24 py-1.5"
        />
        {showExample && (
          <span className="text-xs text-[var(--color-text-secondary)]">
            0.35 × {scaleFactor} = {(0.35 * scaleFactor).toFixed(2)}
          </span>
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={invertSign}
          onChange={(e) => onInvertChange(e.target.checked)}
          className="rounded border-[var(--color-btn-secondary-border)]"
        />
        <span className="text-sm text-[var(--color-text-primary)]">
          Expense and income amounts are stored as negative numbers in this file
        </span>
      </label>
    </div>
  );
}

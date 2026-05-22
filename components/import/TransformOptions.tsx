'use client';
import { useState } from 'react';

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
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        Value transformation (optional)
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-zinc-700 dark:text-zinc-300">Scale factor</label>
        <input
          type="number"
          step="any"
          min="0"
          value={scaleStr}
          onChange={handleScaleInput}
          className="w-24 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm"
        />
        {showExample && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            0.35 × {scaleFactor} = {(0.35 * scaleFactor).toFixed(2)}
          </span>
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={invertSign}
          onChange={(e) => onInvertChange(e.target.checked)}
          className="rounded border-zinc-300 dark:border-zinc-600"
        />
        <span className="text-sm text-zinc-700 dark:text-zinc-300">
          Expense and income amounts are stored as negative numbers in this file
        </span>
      </label>
    </div>
  );
}

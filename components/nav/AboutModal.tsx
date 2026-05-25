'use client';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-backdrop)] px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl overflow-y-auto max-h-[80vh] scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            About Niffler
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-btn-secondary-hover)] transition-colors"
            aria-label="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-6 text-sm text-[var(--color-text-primary)]">
          <section className="flex flex-col gap-2">
            <h3 className="font-semibold text-[var(--color-text-primary)]">The Name</h3>
            <p className="leading-relaxed">
              Niffler is a magical creature from the Harry Potter universe — a small, burrowing
              beast with an insatiable obsession with shiny things: gold coins, gems, anything that
              glitters. It will raid your pockets to fill its own pouch without a second thought.
              For a personal finance tracker, it felt like the right mascot: something relentlessly
              focused on where every coin goes.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-semibold text-[var(--color-text-primary)]">What Niffler Does</h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>Log daily expenses by category and track income.</li>
              <li>Review monthly summaries and stay within budget limits.</li>
              <li>Analyse trends over any date range or all time with charts.</li>
              <li>Import transactions from Excel (.xlsx) files.</li>
              <li>Customise which metrics you see and how charts are coloured in Settings.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-semibold text-[var(--color-text-primary)]">Metrics Reference</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-1.5 pr-4 font-semibold text-[var(--color-text-primary)] whitespace-nowrap">
                      Metric
                    </th>
                    <th className="text-left py-1.5 font-semibold text-[var(--color-text-primary)]">
                      What it means
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {[
                    {
                      metric: 'Expenses',
                      desc: 'Sum of all expenses recorded for the period.',
                    },
                    {
                      metric: 'Income',
                      desc: 'Sum of all income recorded for the period.',
                    },
                    {
                      metric: 'Net',
                      desc: 'Income − Expenses. Positive = earned more than spent; negative = spent more than earned.',
                    },
                    {
                      metric: 'Median/Day',
                      desc: 'Median of daily expense totals across days that had at least one expense. More robust than an average — one unusually expensive day doesn’t distort it.',
                    },
                    {
                      metric: 'Median/Month',
                      desc: 'Median of monthly expense totals across months that had at least one expense. Shows your typical monthly spend regardless of seasonal outliers.',
                    },
                    {
                      metric: 'Limit',
                      desc: 'The daily spending cap you set. The monthly figure is the sum of all daily limits within that month.',
                    },
                    {
                      metric: 'Limit Diff',
                      desc: 'Limit − Expenses for the period. Positive = under budget; negative = over budget.',
                    },
                    {
                      metric: 'Balance',
                      desc: 'All-time only. Initial Budget + Total Income − Total Expenses. The running state of your finances from day one in the app.',
                    },
                  ].map(({ metric, desc }) => (
                    <tr key={metric}>
                      <td className="py-2 pr-4 font-medium text-[var(--color-text-primary)] whitespace-nowrap align-top">
                        {metric}
                      </td>
                      <td className="py-2 leading-relaxed align-top">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

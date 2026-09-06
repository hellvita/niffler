'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useCategoryColors } from '@/lib/hooks/useCategoryColors';
import { useRechartsTheme } from '@/lib/hooks/useRechartsTheme';
import { EmptyState } from '@/components/shared/EmptyState';

export interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  amount: number;
}

const OTHER_ID = '_other';
const OTHER_THRESHOLD = 0.01;

/**
 * Prepares pie slice data: collapses categories below 1% of total into a single "Other"
 * slice, and orders real slices by amount descending so the chart reads largest-to-smallest.
 * "Other" is appended last regardless of its own size — it is a bucket, not a category, so
 * it should not compete for rank.
 *
 * Sorting happens AFTER the <1% split so the threshold is measured against the untouched
 * total. Array.prototype.sort is stable (ES2019), so categories with equal amounts keep
 * their incoming order deterministically — no tie-breaker needed.
 *
 * Extracted from the component body so the ordering is unit-testable: nothing in this repo
 * renders Recharts under jsdom, where ResponsiveContainer collapses to zero size.
 */
export function buildPieData(categories: CategoryTotal[]): CategoryTotal[] {
  const total = categories.reduce((s, c) => s + c.amount, 0);
  // .filter() returns a fresh array, so sorting in place does not mutate the caller's input.
  const significant = categories
    .filter((c) => c.amount / total >= OTHER_THRESHOLD)
    .sort((a, b) => b.amount - a.amount);
  const otherAmount = categories
    .filter((c) => c.amount / total < OTHER_THRESHOLD)
    .reduce((s, c) => s + c.amount, 0);

  return [
    ...significant,
    ...(otherAmount > 0
      ? [{ categoryId: OTHER_ID, categoryName: 'Other', amount: otherAmount }]
      : []),
  ];
}

export function ExpensePieChart({ categories }: { categories: CategoryTotal[] }) {
  const { getColor } = useCategoryColors();
  const theme = useRechartsTheme();

  if (categories.length === 0) {
    return <EmptyState message="No expense data for this period." className="h-64" />;
  }

  // `total` is still needed for the tooltip percentage below. Both of these sit after the
  // empty-categories early return, so `total` is never 0 in that division.
  const total = categories.reduce((s, c) => s + c.amount, 0);
  const data = buildPieData(categories);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="categoryName"
          cx="50%"
          cy="50%"
          outerRadius={110}
          label={({ name, percent }) =>
            (percent ?? 0) >= 0.05 ? `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%` : ''
          }
          labelLine={false}
        >
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.categoryId === OTHER_ID ? theme.muted : getColor(entry.categoryId)}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            const v = typeof value === 'number' ? value : Number(value);
            return [`${v.toFixed(2)} (${((v / total) * 100).toFixed(1)}%)`, name];
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

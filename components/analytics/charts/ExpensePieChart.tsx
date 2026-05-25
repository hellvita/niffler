'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useCategoryColors } from '@/lib/hooks/useCategoryColors';

interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  amount: number;
}

export function ExpensePieChart({ categories }: { categories: CategoryTotal[] }) {
  const { getColor } = useCategoryColors();
  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-[var(--color-text-muted)]">
        No expense data for this period.
      </div>
    );
  }

  const total = categories.reduce((s, c) => s + c.amount, 0);
  const significant = categories.filter((c) => c.amount / total >= 0.01);
  const otherAmount = categories
    .filter((c) => c.amount / total < 0.01)
    .reduce((s, c) => s + c.amount, 0);

  const data: CategoryTotal[] = [
    ...significant,
    ...(otherAmount > 0
      ? [{ categoryId: '_other', categoryName: 'Other', amount: otherAmount }]
      : []),
  ];

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
              fill={entry.categoryId === '_other' ? '#71717a' : getColor(entry.categoryId, i)}
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

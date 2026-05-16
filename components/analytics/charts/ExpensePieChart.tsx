'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  amount: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6', '#f97316', '#84cc16'];

export function ExpensePieChart({ categories }: { categories: CategoryTotal[] }) {
  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-zinc-400 dark:text-zinc-500">
        No expense data for this period.
      </div>
    );
  }

  const total = categories.reduce((s, c) => s + c.amount, 0);
  const significant = categories.filter(c => c.amount / total >= 0.01);
  const otherAmount = categories
    .filter(c => c.amount / total < 0.01)
    .reduce((s, c) => s + c.amount, 0);

  const data: CategoryTotal[] = [
    ...significant,
    ...(otherAmount > 0 ? [{ categoryId: '_other', categoryName: 'Other', amount: otherAmount }] : []),
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
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
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

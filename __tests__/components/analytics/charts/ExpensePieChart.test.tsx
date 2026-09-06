import { describe, it, expect } from 'vitest';
import { buildPieData, type CategoryTotal } from '@/components/analytics/charts/ExpensePieChart';

// Only the pure data-prep helper is exercised here. The component itself renders Recharts
// through ResponsiveContainer, which collapses to zero size under jsdom, so slice order is
// asserted on the array the chart is handed rather than on rendered output.

const cat = (id: string, amount: number): CategoryTotal => ({
  categoryId: id,
  categoryName: id,
  amount,
});

const names = (data: CategoryTotal[]) => data.map((c) => c.categoryName);

describe('buildPieData', () => {
  it('orders slices by amount descending', () => {
    const result = buildPieData([cat('clothes', 10), cat('glasses', 37), cat('music', 17)]);
    expect(names(result)).toEqual(['glasses', 'music', 'clothes']);
  });

  it('reorders the reported bug case into largest-first order', () => {
    // Amounts taken from the "All time" screenshot that prompted this fix — they arrived in
    // chronological order of first appearance, which is what made the chart look unsorted.
    const result = buildPieData([
      cat('music', 17),
      cat('games', 12),
      cat('transport', 5),
      cat('glasses', 37),
      cat('clothes', 10),
      cat('restaurant', 9),
      cat('gifts', 10),
    ]);
    expect(names(result)).toEqual([
      'glasses',
      'music',
      'games',
      'clothes',
      'gifts',
      'restaurant',
      'transport',
    ]);
  });

  it('collapses categories below 1% of total into a single Other slice summing their amounts', () => {
    const result = buildPieData([cat('big', 1000), cat('tiny-a', 4), cat('tiny-b', 5)]);
    expect(names(result)).toEqual(['big', 'Other']);
    expect(result[1]).toMatchObject({ categoryId: '_other', amount: 9 });
  });

  it('places Other last even when it outweighs a real slice', () => {
    // 12 sub-1% categories of 8 each = 96, which exceeds the 20 of the smallest real category.
    const tiny = Array.from({ length: 12 }, (_, i) => cat(`tiny-${i}`, 8));
    const result = buildPieData([cat('big', 900), cat('small', 20), ...tiny]);
    expect(names(result)).toEqual(['big', 'small', 'Other']);
    expect(result.at(-1)).toMatchObject({ categoryId: '_other', amount: 96 });
  });

  it('omits Other entirely when every category is at or above the threshold', () => {
    const result = buildPieData([cat('a', 50), cat('b', 30), cat('c', 20)]);
    expect(names(result)).toEqual(['a', 'b', 'c']);
    expect(result.some((c) => c.categoryId === '_other')).toBe(false);
  });

  it('does not mutate the caller array', () => {
    const input = [cat('clothes', 10), cat('glasses', 37), cat('music', 17)];
    buildPieData(input);
    expect(names(input)).toEqual(['clothes', 'glasses', 'music']);
  });

  it('keeps incoming order for equal amounts (stable sort, no tie-breaker needed)', () => {
    const result = buildPieData([cat('gifts', 10), cat('clothes', 10), cat('glasses', 37)]);
    expect(names(result)).toEqual(['glasses', 'gifts', 'clothes']);
  });
});

'use client';
import { useSearchParams } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { getMonthsInRange, aggregateTotals, buildChartSeries, chooseBucket } from '@/lib/utils/aggregation';
import { getMonthSummary } from '@/lib/api/summary';
import { useAllTimeSummary, useAllTimeMonthlySummary } from '@/lib/hooks/useSummary';
import { useLimits } from '@/lib/hooks/useLimits';
import type { MonthSummary } from '@/lib/types/api';
import { useColumnPreferences } from '@/lib/hooks/useColumnPreferences';
import { DateRangePicker } from './DateRangePicker';
import { ChartTypeSelector } from './ChartTypeSelector';
import { ExpensePieChart } from './charts/ExpensePieChart';
import { ExpenseBarChart } from './charts/ExpenseBarChart';
import { ExpenseLineChart } from './charts/ExpenseLineChart';

function defaultRange() {
  const today = new Date();
  return {
    from: format(startOfMonth(today), 'yyyy-MM-dd'),
    to: format(endOfMonth(today), 'yyyy-MM-dd'),
  };
}

export function AnalyticsView() {
  const searchParams = useSearchParams();
  const preset = searchParams.get('preset');
  const isAllTime = preset === 'all-time';

  const defaults = defaultRange();
  const fromStr = searchParams.get('from') ?? defaults.from;
  const toStr = searchParams.get('to') ?? defaults.to;
  const chartType = (searchParams.get('chart') ?? 'bar') as 'pie' | 'bar' | 'line';

  const from = parseISO(fromStr);
  const to = parseISO(toStr);
  const months = isAllTime ? [] : getMonthsInRange(from, to);

  const monthResults = useQueries({
    queries: months.map(([year, month]) => {
      const mo = String(month).padStart(2, '0');
      return {
        queryKey: ['summary', 'month', String(year), mo],
        queryFn: () => getMonthSummary(`${year}-${mo}`),
        staleTime: 30_000,
      };
    }),
  });

  const { data: allTimeData, isLoading: allTimeLoading } = useAllTimeSummary();
  const { data: allTimeMonthlySummaries = [], isLoading: allTimeMonthlyLoading } =
    useAllTimeMonthlySummary(isAllTime);
  const { data: limits } = useLimits();
  const { preferences: prefs } = useColumnPreferences();

  const isLoading = monthResults.some(r => r.isLoading);
  const summaries = monthResults
    .map(r => r.data)
    .filter((d): d is MonthSummary => d !== undefined);

  const allLoaded = summaries.length === months.length;

  const displaySummaries = isAllTime ? allTimeMonthlySummaries : summaries;
  const chartLoading = isAllTime ? allTimeMonthlyLoading : isLoading;

  const chartFrom = isAllTime && allTimeMonthlySummaries.length > 0
    ? new Date(allTimeMonthlySummaries[0].year, allTimeMonthlySummaries[0].month - 1, 1)
    : from;
  const chartTo = isAllTime && allTimeMonthlySummaries.length > 0
    ? endOfMonth(new Date(
        allTimeMonthlySummaries.at(-1)!.year,
        allTimeMonthlySummaries.at(-1)!.month - 1,
        1,
      ))
    : to;

  const totalsReady = isAllTime ? !allTimeMonthlyLoading : allLoaded;
  const totals = totalsReady && displaySummaries.length > 0
    ? aggregateTotals(displaySummaries, chartFrom, chartTo)
    : null;
  const chartData = totals ? buildChartSeries(displaySummaries, chartFrom, chartTo) : [];

  const hasAnyLimit = (limits?.length ?? 0) > 0;

  const summaryItems: { label: string; value: number | null }[] = isAllTime && allTimeData
    ? [
        { key: 'totalExpenses' as const,  value: allTimeData.totalExpenses },
        { key: 'income' as const,         value: allTimeData.totalIncome },
        { key: 'net' as const,            value: allTimeData.net },
        { key: 'currentBalance' as const, value: allTimeData.currentBalance },
      ]
        .filter(item => prefs[item.key].visible)
        .map(item => ({ label: prefs[item.key].label, value: item.value }))
    : totals
    ? [
        { key: 'totalExpenses' as const,  value: totals.totalExpenses },
        { key: 'income' as const,         value: totals.totalIncome },
        ...(totals.allowedBudget !== null
          ? [{ key: 'effectiveLimit' as const, value: totals.allowedBudget }]
          : []),
        { key: 'net' as const, value: totals.net },
      ]
        .filter(item => prefs[item.key].visible)
        .map(item => ({ label: prefs[item.key].label, value: item.value }))
    : [];

  const summaryLoading = isAllTime ? allTimeLoading : isLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Analytics</h1>

      <DateRangePicker from={fromStr} to={toStr} preset={preset} />

      {summaryLoading ? (
        <div className="h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      ) : summaryItems.length > 0 ? (
        <div className="flex flex-wrap gap-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-6 py-4">
          {summaryItems.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {label}
              </span>
              <span
                className={`text-xl font-semibold tabular-nums ${
                  value === null
                    ? 'text-zinc-400 dark:text-zinc-600'
                    : value < 0
                      ? 'text-red-500'
                      : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {value === null ? '—' : value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {chartLoading
              ? 'Loading…'
              : (() => {
                  const bucket = chooseBucket(chartFrom, chartTo);
                  const n = chartData.length;
                  const unit = bucket === 'day' ? 'day' : bucket === 'week' ? 'week' : 'month';
                  return `${n} ${unit}${n !== 1 ? 's' : ''} of data`;
                })()}
          </span>
          <ChartTypeSelector value={chartType} />
        </div>

        {chartLoading ? (
          <div className="h-72 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ) : (
          <div>
            {chartType === 'pie' && totals && (
              <ExpensePieChart categories={totals.expensesByCategory} />
            )}
            {chartType === 'bar' && <ExpenseBarChart data={chartData} />}
            {chartType === 'line' && <ExpenseLineChart data={chartData} />}
          </div>
        )}
      </>
    </div>
  );
}

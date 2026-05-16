import { Suspense } from 'react';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
          <div className="h-8 w-40 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-72 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>
      }
    >
      <AnalyticsView />
    </Suspense>
  );
}

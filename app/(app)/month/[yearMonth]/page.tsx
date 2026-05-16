import { MonthView } from '@/components/month/MonthView';

export default async function MonthPage({
  params,
}: {
  params: Promise<{ yearMonth: string }>;
}) {
  const { yearMonth } = await params;
  return <MonthView yearMonth={yearMonth} />;
}

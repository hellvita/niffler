import { DayView } from '@/components/day/DayView';

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return <DayView date={date} />;
}

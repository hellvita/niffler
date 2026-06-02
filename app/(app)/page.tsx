import { redirect } from 'next/navigation';
import { format } from 'date-fns';

export default function AppRootPage() {
  redirect(`/day/${format(new Date(), 'yyyy-MM-dd')}`);
}

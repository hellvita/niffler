import { cookies } from 'next/headers';
import { format } from 'date-fns';
import { NavBar } from '@/components/nav/NavBar';
import { SessionExpiredModal } from '@/components/providers/SessionExpiredModal';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const emailCookie = cookieStore.get('user_email');
  const email = emailCookie ? decodeURIComponent(emailCookie.value) : null;

  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  const currentMonth = format(now, 'yyyy-MM');

  return (
    <>
      <NavBar email={email} today={today} currentMonth={currentMonth} />
      <main className="bg-[var(--color-bg)] min-h-screen">{children}</main>
      <SessionExpiredModal email={email} />
    </>
  );
}

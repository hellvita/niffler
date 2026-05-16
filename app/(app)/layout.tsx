import { NavBar } from '@/components/nav/NavBar';
import { SessionExpiredModal } from '@/components/providers/SessionExpiredModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
      <SessionExpiredModal />
    </>
  );
}

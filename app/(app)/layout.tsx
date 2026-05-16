import { SessionExpiredModal } from '@/components/providers/SessionExpiredModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SessionExpiredModal />
    </>
  );
}

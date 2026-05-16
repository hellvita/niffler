import { redirect } from 'next/navigation';

export default function AppRootPage() {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  redirect(`/day/${today}`);
}

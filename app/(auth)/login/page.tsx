import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = { title: 'Sign in — Niffler' };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm text-zinc-900">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Sign in to Niffler</h1>
        <LoginForm />
      </div>
    </div>
  );
}

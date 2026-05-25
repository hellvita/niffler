import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = { title: 'Sign in — Niffler' };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <div className="w-full max-w-sm rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] p-8 shadow-sm text-[var(--color-text-primary)]">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Sign in to Niffler</h1>
        <LoginForm />
      </div>
    </div>
  );
}

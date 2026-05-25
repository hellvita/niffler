import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = { title: 'Create account — Niffler' };

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <div className="w-full max-w-sm rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] p-8 shadow-sm text-[var(--color-text-primary)]">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Create your account</h1>
        <RegisterForm />
      </div>
    </div>
  );
}

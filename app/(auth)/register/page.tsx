import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = { title: 'Create account — Niffler' };

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-sm text-zinc-900">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Create your account</h1>
        <RegisterForm />
      </div>
    </div>
  );
}

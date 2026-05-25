'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '@/lib/validation/schemas';
import { useLogin } from '@/lib/hooks/useAuth';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';

export function LoginForm() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), reValidateMode: 'onBlur' });

  const onSubmit = (data: LoginInput) => {
    login(data, {
      onSuccess: () => router.push('/'),
      onError: (err: unknown) => {
        const apiErr = err as { data?: { detail?: string; title?: string } };
        const message = apiErr.data?.detail ?? apiErr.data?.title ?? 'Invalid credentials';
        setError('root', { message });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-[var(--color-text-primary)]">
          Email
        </label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-[var(--color-error)]">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-[var(--color-text-primary)]">
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          error={!!errors.password}
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-[var(--color-error)]">{errors.password.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="rounded bg-[var(--color-error-bg)] px-3 py-2 text-sm text-[var(--color-error)]">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full py-2">
        {isPending ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-[var(--color-text-primary)] underline underline-offset-2"
        >
          Register
        </Link>
      </p>
    </form>
  );
}

'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerSchema, type RegisterInput } from '@/lib/validation/schemas';
import { useRegister } from '@/lib/hooks/useAuth';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';

export function RegisterForm() {
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();
  const {
    register: field,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), reValidateMode: 'onBlur' });

  const onSubmit = ({ email, password }: RegisterInput) => {
    register(
      { email, password },
      {
        onSuccess: () => router.push('/'),
        onError: (err: unknown) => {
          const apiErr = err as { status?: number; data?: { detail?: string; title?: string } };
          if (apiErr.status === 409) {
            setError('root', { message: 'An account with this email already exists.' });
          } else {
            const message = apiErr.data?.detail ?? apiErr.data?.title ?? 'Registration failed';
            setError('root', { message });
          }
        },
      }
    );
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
          {...field('email')}
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
          autoComplete="new-password"
          error={!!errors.password}
          {...field('password')}
        />
        {errors.password && (
          <p className="text-sm text-[var(--color-error)]">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-[var(--color-text-primary)]"
        >
          Confirm password
        </label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          {...field('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-[var(--color-error)]">{errors.confirmPassword.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="rounded bg-[var(--color-error-bg)] px-3 py-2 text-sm text-[var(--color-error)]">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full py-2">
        {isPending ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-[var(--color-text-primary)] underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

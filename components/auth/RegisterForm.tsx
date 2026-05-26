'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerSchema, type RegisterInput } from '@/lib/validation/schemas';
import { useRegister } from '@/lib/hooks/useAuth';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { FormField } from '@/components/shared/FormField';

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
      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          {...field('email')}
        />
      </FormField>

      <FormField label="Password" htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          error={!!errors.password}
          {...field('password')}
        />
      </FormField>

      <FormField
        label="Confirm password"
        htmlFor="confirmPassword"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          {...field('confirmPassword')}
        />
      </FormField>

      {errors.root && (
        <p className="rounded bg-[var(--color-error-bg)] px-3 py-2 text-sm text-[var(--color-error)]">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" loading={isPending} className="w-full py-2">
        Create account
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

'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '@/lib/validation/schemas';
import { useLogin } from '@/lib/hooks/useAuth';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { FormField } from '@/components/shared/FormField';

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
      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          {...register('email')}
        />
      </FormField>

      <FormField label="Password" htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          error={!!errors.password}
          {...register('password')}
        />
      </FormField>

      {errors.root && (
        <p className="rounded bg-[var(--color-error-bg)] px-3 py-2 text-sm text-[var(--color-error)]">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" loading={isPending} className="w-full py-2">
        Sign in
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

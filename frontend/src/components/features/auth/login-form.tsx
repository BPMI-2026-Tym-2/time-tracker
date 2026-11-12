import { LoaderCircle, LucideEye, LucideEyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useFormState, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { LoginSchema } from '@time-tracker/shared';
import { getFieldStyle, RequiredMark } from '@/lib/form-styles';

type LoginFormProps = {
  form: UseFormReturn<LoginSchema>;
  isPending: boolean;
  loginPending: boolean;
  googlePending: boolean;
  errorMessage?: string;
  onSubmit: SubmitHandler<LoginSchema>;
  onGoogleLogin: () => void;
};

export function LoginForm({
  form,
  isPending,
  loginPending,
  googlePending,
  errorMessage,
  onSubmit,
  onGoogleLogin,
}: LoginFormProps) {
  const { control } = form;
  const { errors, dirtyFields } = useFormState({ control });

  const [showPassword, setShowPassword] = useState(false);

  const emailFieldStyle = getFieldStyle(!errors.email, Boolean(dirtyFields.email));
  const passwordFieldStyle = getFieldStyle(!errors.password, Boolean(dirtyFields.password));

  return (
    <div className="flex w-xs flex-col gap-y-6 sm:w-md">
      <h1 className="text-center text-2xl font-bold">Přihlášení</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <FieldGroup>
            <Field className="gap-1" data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email" className={emailFieldStyle}>
                E-mail <RequiredMark />
              </FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="jan.novak@seznam.cz"
                className={emailFieldStyle}
                aria-invalid={Boolean(errors.email)}
                {...form.register('email')}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field className="gap-1" data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password" className={passwordFieldStyle}>
                Heslo <RequiredMark />
              </FieldLabel>
              <span className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className={passwordFieldStyle}
                  aria-invalid={Boolean(errors.password)}
                  {...form.register('password')}
                />
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-0 w-fit -translate-y-1/2 px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <LucideEye size="16" /> : <LucideEyeOff size="16" />}
                </button>
              </span>
              {errors.password && <FieldError>{errors.password.message}</FieldError>}
            </Field>
          </FieldGroup>

          {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}

          <FieldGroup className="gap-2">
            <Button
              type="submit"
              disabled={isPending}
              size="sm"
              className="bg-primary text-background"
            >
              {loginPending ? <LoaderCircle /> : 'Přihlásit se'}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGoogleLogin}
              disabled={isPending}
            >
              <Image src="/svg/google.svg" alt="Google" width={16} height={16} />
              {googlePending ? <LoaderCircle /> : 'Přihlásit se přes Google'}
            </Button>
          </FieldGroup>
        </FieldSet>
      </form>

      <div className="text-muted-foreground flex justify-between text-sm">
        <Link href="/forgot-password" className="hover:underline">
          Zapomněli jste heslo?
        </Link>
        <Link href="/register" className="hover:underline">
          Registrovat se
        </Link>
      </div>
    </div>
  );
}

import { LoaderCircle, LucideEye, LucideEyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { loginSchema } from '@time-tracker/shared';
import { getFieldStyle, RequiredMark } from '@/lib/form-styles';

type LoginFormProps = {
  email: string;
  password: string;
  isPending: boolean;
  loginPending: boolean;
  googlePending: boolean;
  errorMessage?: string;
  onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
  onGoogleLogin: () => void;
};

export function LoginForm({
  email,
  password,
  isPending,
  loginPending,
  googlePending,
  errorMessage,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleLogin,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isEmailValid = email.length > 0 && loginSchema.shape.email.safeParse(email).success;

  const isPasswordValid =
    password.length > 0 && loginSchema.shape.password.safeParse(password).success;

  const emailFieldStyle = getFieldStyle(isEmailValid, email.length > 0);
  const passwordFieldStyle = getFieldStyle(isPasswordValid, password.length > 0);

  return (
    <div className="flex w-xs flex-col gap-y-6 sm:w-md">
      <h1 className="text-center text-2xl font-bold">Přihlášení</h1>

      <form onSubmit={onSubmit} noValidate>
        <FieldSet>
          <FieldGroup>
            <Field className="gap-1" data-invalid={!isEmailValid && email.length > 0}>
              <FieldLabel htmlFor="email" className={emailFieldStyle}>
                E-mail <RequiredMark />
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="jan.novak@seznam.cz"
                value={email}
                onChange={onEmailChange}
                aria-invalid={!isEmailValid && email.length > 0}
                className={emailFieldStyle}
              />
              {!isEmailValid && email.length > 0 && (
                <FieldError>Zadejte platnou e-mailovou adresu.</FieldError>
              )}
            </Field>

            <Field className="gap-1" data-invalid={!isPasswordValid && password.length > 0}>
              <FieldLabel htmlFor="password" className={passwordFieldStyle}>
                Heslo <RequiredMark />
              </FieldLabel>
              <span className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={onPasswordChange}
                  aria-invalid={!isPasswordValid && password.length > 0}
                  className={passwordFieldStyle}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-0 w-fit -translate-y-1/2 px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <LucideEye size="16" /> : <LucideEyeOff size="16" />}
                </button>
              </span>
              {!isPasswordValid && password.length > 0 && (
                <FieldError>Heslo je povinné.</FieldError>
              )}
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

import { LoaderCircle, LucideEye, LucideEyeOff } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import Image from 'next/image';

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
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (googleButtonRef.current) {
      authClient.oneTap({
        button: {
          container: googleButtonRef.current,
          config: {
            theme: 'outline',
            type: 'standard',
            size: 'medium',
            locale: 'cs',
            shape: 'circle',
          },
        },
        autoSelect: true,
        cancelOnTapOutside: true,
      });
    }
  }, []);
  return (
    <div className="flex w-xs flex-col gap-y-6 sm:w-md">
      <h1 className="text-center text-2xl font-bold">Přihlášení</h1>

      <form onSubmit={onSubmit} noValidate>
        <FieldSet>
          <FieldGroup>
            <Field className="gap-1">
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="jan.novak@seznam.cz"
                value={email}
                onChange={onEmailChange}
              />
            </Field>

            <Field className="gap-1">
              <FieldLabel htmlFor="password">Heslo</FieldLabel>
              <span className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'password' : 'text'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={onPasswordChange}
                />
                <Button
                  type="button"
                  className="absolute top-1/2 right-0 -translate-y-1/2"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <LucideEye /> : <LucideEyeOff />}
                </Button>
              </span>
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
        <Link href="/forgot-password">Zapomněli jste heslo?</Link>
        <Link href="/register">Registrovat se</Link>
      </div>
    </div>
  );
}

import { LoaderCircle, LucideEye, LucideEyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type RegisterFormProps = {
  name: string;
  surname: string;
  email: string;
  password: string;
  isPending: boolean;
  errorMessage?: string;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSurnameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
};

export function RegisterForm({
  name,
  surname,
  email,
  password,
  isPending,
  errorMessage,
  onNameChange,
  onSurnameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex w-xs flex-col gap-y-6 sm:w-md">
      <h1 className="text-center text-2xl font-bold">Registrace</h1>

      <form onSubmit={onSubmit} noValidate>
        <FieldSet>
          <FieldGroup>
            <Field className="gap-1">
              <FieldLabel htmlFor="name">Jméno</FieldLabel>
              <Input
                id="name"
                name="name"
                autoComplete="given-name"
                required
                placeholder="Jan"
                value={name}
                onChange={onNameChange}
              />
            </Field>
            <Field className="gap-1">
              <FieldLabel htmlFor="surname">Příjmení</FieldLabel>
              <Input
                id="surname"
                name="surname"
                autoComplete="family-name"
                required
                placeholder="Novák"
                value={surname}
                onChange={onSurnameChange}
              />
            </Field>
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
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={onPasswordChange}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-0 w-fit -translate-y-1/2 px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <LucideEye size="16" /> : <LucideEyeOff size="16" />}
                </button>
              </span>
            </Field>
          </FieldGroup>

          {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}

          <Button
            type="submit"
            disabled={isPending}
            size="sm"
            className="bg-primary text-background"
          >
            {isPending ? <LoaderCircle /> : 'Registrovat'}
          </Button>
        </FieldSet>
      </form>

      <div className="text-muted-foreground flex justify-center text-sm">
        <Link href="/login" className="hover:underline">
          Zpět na přihlášení
        </Link>
      </div>
    </div>
  );
}

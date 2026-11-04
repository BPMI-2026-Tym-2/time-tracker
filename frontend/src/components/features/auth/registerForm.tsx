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
    <>
      <h1>Registrace</h1>

      <form onSubmit={onSubmit}>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Jméno</FieldLabel>
              <Input
                id="name"
                name="name"
                autoComplete="given-name"
                required
                value={name}
                onChange={onNameChange}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="surname">Příjmení</FieldLabel>
              <Input
                id="surname"
                name="surname"
                autoComplete="family-name"
                required
                value={surname}
                onChange={onSurnameChange}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={onEmailChange}
              />
            </Field>
            <Field>
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

          <Button type="submit" disabled={isPending}>
            {isPending ? <LoaderCircle /> : 'Registrovat'}
          </Button>
        </FieldSet>
      </form>

      <Link href="/login">Zpět na přihlášení</Link>
    </>
  );
}

import { LoaderCircle, LucideEye, LucideEyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { registerSchema } from '@time-tracker/shared';
import { getFieldStyle, RequiredMark } from '@/lib/form-styles';

type RegisterFormProps = {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword: string;
  isPending: boolean;
  errorMessage?: string;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSurnameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
};

export function RegisterForm({
  name,
  surname,
  email,
  password,
  confirmPassword,
  isPending,
  errorMessage,
  onNameChange,
  onSurnameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEmailValid = email.length > 0 && registerSchema.shape.email.safeParse(email).success;
  const isPasswordValid =
    password.length > 0 && registerSchema.shape.password.safeParse(password).success;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const emailFieldStyle = getFieldStyle(isEmailValid, email.length > 0);
  const passwordFieldStyle = getFieldStyle(isPasswordValid, password.length > 0);

  const isConfirmPasswordValid =
    confirmPassword.length > 0 && isPasswordValid && password === confirmPassword;

  const confirmPasswordFieldStyle = getFieldStyle(
    isConfirmPasswordValid,
    confirmPassword.length > 0,
  );

  return (
    <div className="flex w-xs flex-col gap-y-6 sm:w-md">
      <h1 className="text-center text-2xl font-bold">Registrace</h1>

      <form onSubmit={onSubmit} noValidate>
        <FieldSet>
          <FieldGroup>
            <Field className="gap-1">
              <FieldLabel htmlFor="name">
                Jméno <RequiredMark />
              </FieldLabel>
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
              <FieldLabel htmlFor="surname">
                Příjmení
                <RequiredMark />
              </FieldLabel>
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
            <Field className="gap-1" data-invalid={!isEmailValid && email.length > 0}>
              <FieldLabel htmlFor="email" className={emailFieldStyle}>
                E-mail
                <RequiredMark />
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
                Heslo
                <RequiredMark />
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
                  className="absolute top-1/2 right-0 mr-2.5 w-fit -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <LucideEye size="16" /> : <LucideEyeOff size="16" />}
                </button>
              </span>
              {!isPasswordValid && password.length > 0 && (
                <FieldError>
                  Heslo musí mít alespoň 8 znaků, obsahovat alespoň jedno velké písmeno, jedno malé
                  písmeno, jedno číslo a jeden speciální znak.
                </FieldError>
              )}
            </Field>
            <Field
              className="gap-1"
              data-invalid={!isConfirmPasswordValid && confirmPassword.length > 0}
            >
              <FieldLabel htmlFor="confirmPassword" className={confirmPasswordFieldStyle}>
                Potvrzení hesla
                <RequiredMark />
              </FieldLabel>
              <span className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={onConfirmPasswordChange}
                  aria-invalid={!isConfirmPasswordValid && confirmPassword.length > 0}
                  className={confirmPasswordFieldStyle}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-0 mr-2.5 w-fit -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <LucideEye size="16" /> : <LucideEyeOff size="16" />}
                </button>
              </span>
              {isPasswordMismatch && confirmPassword.length > 0 && (
                <FieldError>Hesla se neshodují.</FieldError>
              )}
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

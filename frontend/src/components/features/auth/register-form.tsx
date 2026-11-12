import { LoaderCircle, LucideEye, LucideEyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useFormState, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { RegisterSchema } from '@time-tracker/shared';
import { getFieldStyle, RequiredMark } from '@/lib/form-styles';

type RegisterFormProps = {
  isPending: boolean;
  googlePending: boolean;
  errorMessage?: string;
  form: UseFormReturn<RegisterSchema>;
  onSubmit: SubmitHandler<RegisterSchema>;
  onGoogleLogin: () => void;
};

export function RegisterForm({
  isPending,
  googlePending,
  errorMessage,
  form,
  onSubmit,
  onGoogleLogin,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { errors, dirtyFields } = useFormState({ control: form.control });
  const nameFieldStyle = getFieldStyle(!errors.name, Boolean(dirtyFields.name));
  const surnameFieldStyle = getFieldStyle(!errors.surname, Boolean(dirtyFields.surname));
  const emailFieldStyle = getFieldStyle(!errors.email, Boolean(dirtyFields.email));
  const passwordFieldStyle = getFieldStyle(!errors.password, Boolean(dirtyFields.password));
  const confirmPasswordFieldStyle = getFieldStyle(
    !errors.confirmPassword,
    Boolean(dirtyFields.confirmPassword),
  );

  return (
    <div className="flex w-xs flex-col gap-y-6 sm:w-md">
      <h1 className="text-center text-2xl font-bold">Registrace</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldSet>
          <FieldGroup>
            <Field className="gap-1" data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name" className={nameFieldStyle}>
                Jméno <RequiredMark />
              </FieldLabel>
              <Input
                id="name"
                autoComplete="given-name"
                required
                placeholder="Jan"
                className={nameFieldStyle}
                aria-invalid={Boolean(errors.name)}
                {...form.register('name')}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>
            <Field className="gap-1" data-invalid={Boolean(errors.surname)}>
              <FieldLabel htmlFor="surname" className={surnameFieldStyle}>
                Příjmení
                <RequiredMark />
              </FieldLabel>
              <Input
                id="surname"
                autoComplete="family-name"
                required
                placeholder="Novák"
                className={surnameFieldStyle}
                aria-invalid={Boolean(errors.surname)}
                {...form.register('surname')}
              />
              {errors.surname && <FieldError>{errors.surname.message}</FieldError>}
            </Field>
            <Field className="gap-1" data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email" className={emailFieldStyle}>
                E-mail
                <RequiredMark />
              </FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="jan.novak@seznam.cz"
                aria-invalid={Boolean(errors.email)}
                className={emailFieldStyle}
                {...form.register('email')}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>
            <Field className="gap-1" data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password" className={passwordFieldStyle}>
                Heslo
                <RequiredMark />
              </FieldLabel>
              <span className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  aria-invalid={Boolean(errors.password)}
                  className={passwordFieldStyle}
                  {...form.register('password')}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-0 mr-2.5 w-fit -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <LucideEye size="16" /> : <LucideEyeOff size="16" />}
                </button>
              </span>
              {errors.password && <FieldError>{errors.password.message}</FieldError>}
            </Field>
            <Field className="gap-1" data-invalid={Boolean(errors.confirmPassword)}>
              <FieldLabel htmlFor="confirmPassword" className={confirmPasswordFieldStyle}>
                Potvrzení hesla
                <RequiredMark />
              </FieldLabel>
              <span className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className={confirmPasswordFieldStyle}
                  {...form.register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-0 mr-2.5 w-fit -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <LucideEye size="16" /> : <LucideEyeOff size="16" />}
                </button>
              </span>
              {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
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
              {isPending ? <LoaderCircle /> : 'Registrovat'}
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

      <div className="text-muted-foreground flex justify-center text-sm">
        <Link href="/login" className="hover:underline">
          Zpět na přihlášení
        </Link>
      </div>
    </div>
  );
}

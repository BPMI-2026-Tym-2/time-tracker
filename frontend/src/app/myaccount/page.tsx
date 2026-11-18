'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PasswordVisibilityField } from '@/components/features/account/password-visibility-field';
import { Field, FieldContent, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { authClient } from '@/lib/auth-client';
import { ShieldAlert } from 'lucide-react';
import type { UserProfile } from '@time-tracker/shared';

const profileValueClassName =
  'flex min-h-10 w-full max-w-xs items-center justify-center rounded-lg border border-black/50 bg-muted px-4 py-2 text-center text-sm text-foreground shadow-sm';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function MyAccountPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = authClient.useSession();

  const { data: profile, isLoading: isProfileLoading } = useQuery<UserProfile, Error>({
    queryKey: ['user-me'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Chyba při načítání profilu (${response.status})`);
      }

      const json = await response.json();
      return json.data ?? json;
    },
    enabled: Boolean(session?.user),
    retry: false,
  });

  const isLoading = isSessionLoading || (Boolean(session?.user) && isProfileLoading);

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <Spinner className="text-primary size-8" />
      </main>
    );
  }

  const user = session?.user;

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="border-border bg-card w-full max-w-md space-y-4 rounded-3xl border p-8 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
            <ShieldAlert className="size-6" />
          </div>
          <h2 className="text-xl font-bold">Přihlášení vyžadováno</h2>
          <p className="text-muted-foreground text-sm">
            Pro zobrazení nastavení vlastního profilu se musíte nejprve přihlásit.
          </p>
          <Button variant="default" onClick={() => router.push('/login')}>
            Přejít na přihlášení
          </Button>
        </div>
      </main>
    );
  }

  const firstName = user.name || profile?.name || '';
  const lastName = (user as { surname?: string }).surname || profile?.surname || '';
  const email = user.email || profile?.email || '';
  const photoUrl = user.image || profile?.profileImageUrl || null;
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  const hasPassword = profile?.hasPassword ?? true;

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
        <FieldSet className="bg-card relative w-full items-center overflow-hidden rounded-xl border border-black/50 pb-8 text-center shadow-sm">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-24 border-b border-black/50 bg-[#ecdec8]"
          />
          <div className="relative z-10 flex h-44 w-full justify-center">
            <Avatar size="lg" className="ring-card mt-8 size-20 ring-8 after:border-black/50">
              {photoUrl && (
                <AvatarImage src={photoUrl} alt={`${firstName} ${lastName}'s profile photo`} />
              )}
              <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
          </div>
          <FieldGroup className="relative z-10 mt-0 w-full items-center gap-5 px-6 sm:px-8">
            <Field className="items-center text-center">
              <FieldLabel htmlFor="full-name" className="justify-center text-center">
                Jméno
              </FieldLabel>
              <FieldContent className="items-center text-center">
                <output id="full-name" className={profileValueClassName}>
                  {firstName || '—'}
                </output>
              </FieldContent>
            </Field>

            <Field className="items-center text-center">
              <FieldLabel htmlFor="username" className="justify-center text-center">
                Příjmení
              </FieldLabel>
              <FieldContent className="items-center text-center">
                <output id="username" className={profileValueClassName}>
                  {lastName || '—'}
                </output>
              </FieldContent>
            </Field>

            <Field className="items-center text-center">
              <FieldLabel htmlFor="email" className="justify-center text-center">
                E-mail
              </FieldLabel>
              <FieldContent className="items-center text-center">
                <output id="email" className={profileValueClassName}>
                  {email || '—'}
                </output>
              </FieldContent>
            </Field>

            {!hasPassword ? (
              <Field className="items-center text-center">
                <FieldLabel htmlFor="profile-password" className="justify-center text-center">
                  Heslo
                </FieldLabel>
                <FieldContent className="items-center text-center">
                  <output id="profile-password" className={profileValueClassName}>
                    Spravuje Google
                  </output>
                </FieldContent>
              </Field>
            ) : (
              <Field className="mx-auto w-full max-w-sm items-center text-center">
                <FieldLabel htmlFor="profile-password" className="justify-center text-center">
                  Heslo
                </FieldLabel>
                <FieldContent className="w-full items-center text-center">
                  <PasswordVisibilityField id="profile-password" />
                </FieldContent>
              </Field>
            )}
          </FieldGroup>
        </FieldSet>

        <div className="flex w-full max-w-3xl justify-end pr-8">
          <Button type="button" variant="outline" className="border-black/50">
            Upravit profil
          </Button>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import { getProfile, saveProfile } from '@/lib/api/profile';
import { ShieldAlert, UserRound } from 'lucide-react';
import {
  PROFILE_IMAGE_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  userSchema,
  type UserProfile,
} from '@time-tracker/shared';

const valueClassName =
  'min-h-11 w-full rounded-xl border border-foreground/60 bg-[#f8f5ee] px-3.5 py-2 text-base text-[#211e18]';

const longNameWarning = 'Pozor, jméno je příliš dlouhé.';
type NameField = 'name' | 'surname';

const profileFields = [
  { name: 'name', label: 'Jméno', type: 'text', autoComplete: 'given-name' },
  { name: 'surname', label: 'Příjmení', type: 'text', autoComplete: 'family-name' },
  { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email' },
] as const;

async function prepareProfilePhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Vyberte obrázek ve formátu JPG, PNG nebo WebP.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Obrázek může mít maximálně 10 MB.');
  }

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Obrázek se nepodařilo zpracovat.');

    const crop = Math.min(bitmap.width, bitmap.height);
    context.drawImage(
      bitmap,
      (bitmap.width - crop) / 2,
      (bitmap.height - crop) / 2,
      crop,
      crop,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const photo = canvas.toDataURL('image/webp', 0.8);
    if (photo.length > PROFILE_IMAGE_MAX_LENGTH) {
      throw new Error('Vyberte menší obrázek.');
    }
    return photo;
  } finally {
    bitmap.close();
  }
}

export default function MyAccountPage() {
  const router = useRouter();
  const {
    data: session,
    isPending: isSessionLoading,
    refetch: refreshSession,
  } = authClient.useSession();

  const { data: profile, isLoading: isProfileLoading } = useQuery<UserProfile, Error>({
    queryKey: ['user-me', session?.user.id],
    queryFn: ({ signal }) => getProfile(signal),
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

  if (!profile) {
    return (
      <main className="flex flex-1 items-center justify-center p-8">
        <p role="alert">Profil se nepodařilo načíst.</p>
      </main>
    );
  }

  return (
    <AccountProfile
      key={user.id}
      userId={user.id}
      profile={profile}
      onSaved={() => void refreshSession()}
    />
  );
}

function AccountProfile({
  userId,
  profile,
  onSaved,
}: {
  userId: string;
  profile: UserProfile;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [emailWarning, setEmailWarning] = useState(false);
  const [fieldMessages, setFieldMessages] = useState<Partial<Record<NameField, string>>>({});
  const [photo, setPhoto] = useState<string>();
  const [preparingPhoto, setPreparingPhoto] = useState(false);
  const [error, setError] = useState<string>();
  const { mutate, isPending } = useMutation({
    mutationFn: saveProfile,
    onSuccess: async (saved) => {
      const queryKey = ['user-me', userId];
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, saved);
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setPhoto(undefined);
      setEditing(false);
      onSaved();
    },
    onError: (error) => setError(error.message),
  });

  const busy = isPending || preparingPhoto;
  const photoUrl = photo ?? profile.profileImageUrl;

  function cancel() {
    setConfirmCancel(false);
    setEmailWarning(false);
    setFieldMessages({});
    setPhoto(undefined);
    setError(undefined);
    setEditing(false);
  }

  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    setError(undefined);
    setPreparingPhoto(true);
    try {
      setPhoto(await prepareProfilePhoto(file));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Obrázek se nepodařilo načíst.');
    } finally {
      setPreparingPhoto(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || busy) return;

    const fields = new FormData(event.currentTarget);
    const result = userSchema.updateProfileRequest.safeParse({
      name: fields.get('name'),
      surname: fields.get('surname'),
      profileImageUrl: photo,
    });
    if (!result.success) {
      const messages: Partial<Record<NameField, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === 'name' || field === 'surname') {
          messages[field] = issue.code === 'too_big' ? longNameWarning : issue.message;
        }
      }
      setFieldMessages(messages);
      setError(result.error.issues.find(({ path }) => path[0] === 'profileImageUrl')?.message);
      return;
    }
    setFieldMessages({});
    setEmailWarning(false);
    setError(undefined);
    mutate(result.data);
  }

  return (
    <main className="bg-card flex min-w-0 flex-1 flex-col">
      <form className="flex flex-1 flex-col" onSubmit={submit} noValidate>
        <div className="border-foreground/60 relative flex h-28 shrink-0 justify-center border-b bg-[#ecdec8] sm:h-32">
          <div
            aria-hidden="true"
            className="bg-card border-foreground/60 absolute bottom-0 h-20 w-40 translate-y-px rounded-t-full border border-b-0 sm:h-26 sm:w-52"
          />
          <Avatar className="after:border-foreground/80 absolute bottom-0 z-10 size-28 translate-y-1/2 sm:size-36">
            {photoUrl && <AvatarImage src={photoUrl} alt="Profilová fotka" />}
            <AvatarFallback className="bg-[#d8d8d8] text-white">
              <UserRound aria-hidden="true" className="size-3/5" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mx-auto flex w-full max-w-[20rem] flex-col gap-3 px-5 pt-18 pb-6 sm:pt-24">
          {editing && (
            <div className="mb-1 flex justify-center">
              <Input
                type="file"
                aria-label="Změnit profilovou fotku"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                className="h-auto w-auto max-w-full cursor-pointer border-0 bg-transparent px-1 py-2 file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#ecdec8] file:px-3 file:py-1 file:text-sm file:font-medium"
                onChange={(event) => void choosePhoto(event)}
              />
            </div>
          )}
          {profileFields.map(({ name, label, type, autoComplete }) => (
            <div key={name} className="space-y-1">
              {editing ? (
                <>
                  <Label htmlFor={`account-${name}`} className="px-2 text-base font-semibold">
                    {label}
                  </Label>
                  <Input
                    id={`account-${name}`}
                    name={name}
                    type={type}
                    autoComplete={autoComplete}
                    className={valueClassName}
                    defaultValue={profile[name]}
                    readOnly={name === 'email'}
                    disabled={busy}
                    required={name !== 'email'}
                    aria-invalid={name !== 'email' && Boolean(fieldMessages[name])}
                    aria-describedby={
                      (name === 'email' ? emailWarning : fieldMessages[name])
                        ? `account-${name}-message`
                        : undefined
                    }
                    onFocus={name === 'email' ? () => setEmailWarning(true) : undefined}
                    onClick={name === 'email' ? () => setEmailWarning(true) : undefined}
                    onChange={(event) => {
                      if (name === 'email') return;
                      const tooLong =
                        event.currentTarget.value.trim().length > PROFILE_NAME_MAX_LENGTH;
                      setFieldMessages((messages) => ({
                        ...messages,
                        [name]: tooLong ? longNameWarning : undefined,
                      }));
                    }}
                  />
                  {name === 'email'
                    ? emailWarning && (
                        <p
                          id="account-email-message"
                          role="status"
                          className="px-2 text-sm text-amber-800 dark:text-amber-300"
                        >
                          E-mail nelze změnit.
                        </p>
                      )
                    : fieldMessages[name] && (
                        <p
                          id={`account-${name}-message`}
                          role="alert"
                          className={
                            fieldMessages[name] === longNameWarning
                              ? 'px-2 text-sm text-amber-800 dark:text-amber-300'
                              : 'text-destructive px-2 text-sm'
                          }
                        >
                          {fieldMessages[name]}
                        </p>
                      )}
                </>
              ) : (
                <>
                  <p className="px-2 text-base font-semibold">{label}</p>
                  <p className={`${valueClassName} wrap-anywhere`}>{profile[name]}</p>
                </>
              )}
            </div>
          ))}
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 p-4 sm:p-6">
          {editing ? (
            <>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => setConfirmCancel(true)}
                disabled={busy}
              >
                Zrušit
              </Button>
              <Button type="submit" size="lg" variant="outline" disabled={busy}>
                {isPending ? 'Ukládám…' : 'Uložit změny'}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="ml-auto"
              onClick={() => setEditing(true)}
            >
              Upravit profil
            </Button>
          )}
        </div>
      </form>
      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zrušit úpravu profilu?</AlertDialogTitle>
            <AlertDialogDescription>
              Vytvořené změny budou ztraceny. Opravdu chcete pokračovat?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zpět</AlertDialogCancel>
            <AlertDialogAction type="button" variant="destructive" onClick={cancel}>
              Potvrdit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

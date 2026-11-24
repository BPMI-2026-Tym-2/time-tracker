'use client';

import { useEffect, useRef, useState, type FormEvent, type ChangeEvent } from 'react';
import { Camera } from 'lucide-react';
import { userSchema, type UpdateProfileRequest, type UserProfile } from '@time-tracker/shared';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarXL } from '@/components/features/profile/avatar-xl';
import { Button } from '@/components/ui/button';
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
import { Field, FieldContent, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';

type ProfileDetailsProps = {
  profile: UserProfile;
  onSave: (values: UpdateProfileRequest) => Promise<void>;
};

type EditableField = 'name' | 'surname';

const profileValueClassName =
  'flex min-h-10 w-full max-w-xs items-center justify-center rounded-lg border border-black/50 bg-muted px-4 py-2 text-center text-sm text-foreground shadow-sm';

export function ProfileDetails({ profile, onSave }: ProfileDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(profile.name);
  const [surname, setSurname] = useState(profile.surname);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<EditableField, string>>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const profileInitials = `${profile.name[0] ?? ''}${profile.surname[0] ?? ''}` || '?';

  useEffect(() => {
    return () => {
      if (selectedImagePreview) {
        URL.revokeObjectURL(selectedImagePreview);
      }
    };
  }, [selectedImagePreview]);

  function startEditing() {
    setName(profile.name);
    setSurname(profile.surname);
    setFieldErrors({});
    setSaveError(null);
    setPhotoError(null);
    setSelectedImagePreview(null);
    setIsEditing(true);
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';

    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Vyberte obrázek ve formátu JPG, PNG nebo WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Obrázek může mít maximálně 5 MB.');
      return;
    }

    setPhotoError(null);
    setSelectedImagePreview(URL.createObjectURL(file));
  }

  function discardChanges() {
    setName(profile.name);
    setSurname(profile.surname);
    setFieldErrors({});
    setSaveError(null);
    setPhotoError(null);
    setSelectedImagePreview(null);
    setIsCancelDialogOpen(false);
    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setSaveError(null);

    const result = userSchema.updateProfileRequest.safeParse({ name, surname });

    if (!result.success) {
      const nextErrors: Partial<Record<EditableField, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if ((field === 'name' || field === 'surname') && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(result.data);
      toast.add({
        type: 'success',
        title: 'Změny úspěšně uloženy.',
      });
      setSelectedImagePreview(null);
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Profil se nepodařilo uložit.');
    } finally {
      setIsSaving(false);
    }
  }

  const profileAvatar = (
    <AvatarXL className={`ring-card ring-8 after:border-black/50 ${isEditing ? '' : 'mt-8'}`}>
      {(selectedImagePreview ?? profile.profileImageUrl) && (
        <AvatarImage
          src={selectedImagePreview ?? profile.profileImageUrl ?? undefined}
          alt={`${profile.name} ${profile.surname}'s profile photo`}
        />
      )}
      <AvatarFallback>{profileInitials}</AvatarFallback>
    </AvatarXL>
  );

  const profileCard = (
    <FieldSet className="bg-card relative w-full items-center overflow-hidden rounded-xl border border-black/50 pb-8 text-center shadow-sm">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-24 border-b border-black/50 bg-[#ecdec8]"
      />
      <div className="relative z-10 flex h-44 w-full justify-center">
        {isEditing ? (
          <div className="flex flex-col items-center gap-2">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={handlePhotoChange}
              disabled={isSaving}
            />
            <button
              type="button"
              className="group focus-visible:ring-primary relative mt-8 size-32 shrink-0 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              aria-label="Vybrat profilovou fotku"
              onClick={() => photoInputRef.current?.click()}
              disabled={isSaving}
            >
              {profileAvatar}
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/55 px-2 text-center text-[10px] leading-tight text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Camera aria-hidden="true" />
                <span>Kliknutím vyberete fotku (JPG, PNG nebo WebP, max. 5 MB)</span>
              </span>
            </button>
            {photoError && (
              <p role="alert" className="text-destructive text-sm">
                {photoError}
              </p>
            )}
          </div>
        ) : (
          profileAvatar
        )}
      </div>
      <FieldGroup className="relative z-10 mt-0 w-full items-center gap-5 px-6 sm:px-8">
        <Field className="items-center text-center">
          <FieldLabel htmlFor="first-name" className="justify-center text-center">
            Jméno
          </FieldLabel>
          <FieldContent className="items-center text-center">
            {isEditing ? (
              <>
                <Input
                  id="first-name"
                  autoComplete="given-name"
                  className="border-primary/70 focus-visible:border-primary max-w-xs text-center"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'first-name-error' : undefined}
                  disabled={isSaving}
                />
                {fieldErrors.name && (
                  <p id="first-name-error" className="text-destructive text-sm">
                    {fieldErrors.name}
                  </p>
                )}
              </>
            ) : (
              <output id="first-name" className={profileValueClassName}>
                {profile.name}
              </output>
            )}
          </FieldContent>
        </Field>
        <Field className="items-center text-center">
          <FieldLabel htmlFor="last-name" className="justify-center text-center">
            Příjmení
          </FieldLabel>
          <FieldContent className="items-center text-center">
            {isEditing ? (
              <>
                <Input
                  id="last-name"
                  autoComplete="family-name"
                  className="border-primary/70 focus-visible:border-primary max-w-xs text-center"
                  value={surname}
                  onChange={(event) => setSurname(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.surname)}
                  aria-describedby={fieldErrors.surname ? 'last-name-error' : undefined}
                  disabled={isSaving}
                />
                {fieldErrors.surname && (
                  <p id="last-name-error" className="text-destructive text-sm">
                    {fieldErrors.surname}
                  </p>
                )}
              </>
            ) : (
              <output id="last-name" className={profileValueClassName}>
                {profile.surname}
              </output>
            )}
          </FieldContent>
        </Field>
        <Field className="items-center text-center">
          <FieldLabel htmlFor="email" className="justify-center text-center">
            E-mail
          </FieldLabel>
          <FieldContent className="items-center text-center">
            <output
              id="email"
              className={`${profileValueClassName} ${
                isEditing ? 'bg-muted/50 text-muted-foreground border-black/20' : ''
              }`}
            >
              {profile.email}
            </output>
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  );

  return (
    <main className="flex-1 px-6 py-12">
      {isEditing ? (
        <form
          className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8"
          onSubmit={handleSubmit}
        >
          {profileCard}
          {saveError && (
            <p role="alert" className="text-destructive text-center text-sm">
              Profil se nepodařilo uložit: {saveError}
            </p>
          )}
          <div className="flex w-full max-w-3xl items-center justify-between px-8">
            <Button
              type="button"
              variant="outline"
              className="border-black/50"
              onClick={() => setIsCancelDialogOpen(true)}
              disabled={isSaving}
            >
              Zrušit
            </Button>
            <Button type="submit" variant="outline" className="border-black/50" disabled={isSaving}>
              {isSaving ? 'Ukládání…' : 'Uložit'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
          {profileCard}
          <div className="flex w-full max-w-3xl justify-end px-8">
            <Button
              type="button"
              variant="outline"
              className="border-black/50"
              onClick={startEditing}
            >
              Upravit profil
            </Button>
          </div>
        </div>
      )}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zahodit změny?</AlertDialogTitle>
            <AlertDialogDescription>
              Vytvořené změny budou ztraceny. Opravdu chcete pokračovat?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Pokračovat v úpravách</AlertDialogCancel>
            <AlertDialogAction onClick={discardChanges}>Potvrdit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

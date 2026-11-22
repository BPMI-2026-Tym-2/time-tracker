import type { UserProfile } from '@time-tracker/shared';
import { AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarXL } from '@/components/features/profile/avatar-xl';
import { Button } from '@/components/ui/button';
import { Field, FieldContent, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';

type ProfileDetailsProps = {
  profile: UserProfile;
};

const profileValueClassName =
  'flex min-h-10 w-full max-w-xs items-center justify-center rounded-lg border border-black/50 bg-muted px-4 py-2 text-center text-sm text-foreground shadow-sm';

export function ProfileDetails({ profile }: ProfileDetailsProps) {
  const profileInitials = `${profile.name[0] ?? ''}${profile.surname[0] ?? ''}` || '?';

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
        <FieldSet className="bg-card relative w-full items-center overflow-hidden rounded-xl border border-black/50 pb-8 text-center shadow-sm">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-24 border-b border-black/50 bg-[#ecdec8]"
          />
          <div className="relative z-10 flex h-44 w-full justify-center">
            <AvatarXL className="ring-card mt-8 ring-8 after:border-black/50">
              {profile.profileImageUrl && (
                <AvatarImage
                  src={profile.profileImageUrl}
                  alt={`${profile.name} ${profile.surname}'s profile photo`}
                />
              )}
              <AvatarFallback>{profileInitials}</AvatarFallback>
            </AvatarXL>
          </div>
          <FieldGroup className="relative z-10 mt-0 w-full items-center gap-5 px-6 sm:px-8">
            <Field className="items-center text-center">
              <FieldLabel htmlFor="first-name" className="justify-center text-center">
                Jméno
              </FieldLabel>
              <FieldContent className="items-center text-center">
                <output id="first-name" className={profileValueClassName}>
                  {profile.name}
                </output>
              </FieldContent>
            </Field>
            <Field className="items-center text-center">
              <FieldLabel htmlFor="last-name" className="justify-center text-center">
                Příjmení
              </FieldLabel>
              <FieldContent className="items-center text-center">
                <output id="last-name" className={profileValueClassName}>
                  {profile.surname}
                </output>
              </FieldContent>
            </Field>
            <Field className="items-center text-center">
              <FieldLabel htmlFor="email" className="justify-center text-center">
                E-mail
              </FieldLabel>
              <FieldContent className="items-center text-center">
                <output id="email" className={profileValueClassName}>
                  {profile.email}
                </output>
              </FieldContent>
            </Field>
          </FieldGroup>
        </FieldSet>
        <div className="flex w-full max-w-3xl justify-end pr-8">
          <Button type="submit" variant="outline" className="border-black/50">
            Upravit profil
          </Button>
        </div>
      </div>
    </main>
  );
}

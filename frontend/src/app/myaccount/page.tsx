import type { Metadata } from 'next';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PasswordVisibilityField } from '@/components/features/account/password-visibility-field';
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';

// Testovací profil. Pro testovací účely můžete nahradit 'local' za 'google', abyste viděli, jak se mění uživatelské rozhraní.
// Když uživatel nemá profilovou fotku, zobrazí se jeho iniciály.

const profile = {
  firstName: 'Meimei',
  lastName: 'Car',
  email: 'meimei@meme.com',
  photoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjVwu55OXfx29s8Z6_4sc2jK1uteCvTro3VhYE6VxKqg&s=10' as string | null,
  authProvider: 'local' as 'google' | 'local',
  password: 'meow1234?',
};

const profileInitials = `${profile.firstName[0]}${profile.lastName[0]}`;
const profileValueClassName =
  'flex min-h-10 w-full max-w-xs items-center justify-center rounded-lg border border-black/50 bg-muted px-4 py-2 text-center text-sm text-foreground shadow-sm';

export const metadata: Metadata = {
  title: 'My account | Time Tracker',
  description: 'View your Time Tracker profile.',
};

export default function MyAccountPage() {
  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
        <FieldSet className="relative w-full items-center overflow-hidden rounded-xl border border-black/50 bg-card pb-8 text-center shadow-sm">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-24 border-b border-black/50 bg-[#ecdec8]"
          />
          <div className="relative z-10 flex h-44 w-full justify-center">
            <Avatar size="xl" className="mt-8 ring-8 ring-card after:border-black/50">
              {profile.photoUrl && (
                <AvatarImage
                  src={profile.photoUrl}
                  alt={`${profile.firstName} ${profile.lastName}'s profile photo`}
                />
              )}
              <AvatarFallback>{profileInitials}</AvatarFallback>
            </Avatar>
          </div>
          <FieldGroup className="relative z-10 mt-0 w-full items-center gap-5 px-6 sm:px-8">
            <Field className="items-center text-center">
              <FieldLabel htmlFor="full-name" className="justify-center text-center">
                Jméno
              </FieldLabel>
              <FieldContent className="items-center text-center">
                <output id="full-name" className={profileValueClassName}>
                  {profile.firstName}
                </output>
              </FieldContent>
            </Field>
            <Field className="items-center text-center">
              <FieldLabel htmlFor="username" className="justify-center text-center">
                Příjmení
              </FieldLabel>
              <FieldContent className="items-center text-center">
                <output id="username" className={profileValueClassName}>
                  {profile.lastName}
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
            {profile.authProvider === 'google' ? (
              <Field className="items-center text-center">
                <FieldLabel
                  htmlFor="profile-password"
                  className="justify-center text-center"
                >
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
                <FieldLabel
                  htmlFor="profile-password"
                  className="justify-center text-center"
                >
                  Heslo
                </FieldLabel>
                <FieldContent className="w-full items-center text-center">
                  <PasswordVisibilityField
                    id="profile-password"
                    value={profile.password}
                  />
                </FieldContent>
              </Field>
            )}
          </FieldGroup>
        </FieldSet>
        <div className="flex w-full max-w-3xl justify-end pr-8">
          <Button
            type="submit"
            variant="outline"
            className="border-black/50"
          >
            Upravit profil
          </Button>
        </div>
      </div>
    </main>
  );
}
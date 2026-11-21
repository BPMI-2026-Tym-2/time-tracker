'use client';

import { ProfileDetails } from '@/components/features/account/profile-details';
import { useProfile } from '@/hooks/use-profile';

export default function MyAccountPage() {
  const { profile, isLoading, error } = useProfile();

  if (isLoading) {
    return (
      <main className="flex-1 px-6 py-12">
        <p role="status" className="text-center">
          Načítání profilu…
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 px-6 py-12">
        <p role="alert" className="text-center">
          Profil se nepodařilo načíst: {error}
        </p>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return <ProfileDetails profile={profile} />;
}

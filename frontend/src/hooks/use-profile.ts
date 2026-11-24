'use client';

import type { UpdateProfileRequest, UserProfile } from '@time-tracker/shared';
import { useEffect, useState } from 'react';
import { getProfile, updateProfile as saveProfile } from '@/lib/api/profile';

type UseProfileResult = {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (values: UpdateProfileRequest) => Promise<void>;
};

export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function loadProfile() {
      try {
        const result = await getProfile(controller.signal);
        if (isActive) {
          setProfile(result);
        }
      } catch (caughtError) {
        if (isActive && !controller.signal.aborted) {
          setError(
            caughtError instanceof Error ? caughtError.message : 'Nepodařilo se načíst profil.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  async function updateProfile(values: UpdateProfileRequest): Promise<void> {
    const updatedProfile = await saveProfile(values);
    setProfile(updatedProfile);
  }

  return { profile, isLoading, error, updateProfile };
}

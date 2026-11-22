'use client';

import type { UserProfile } from '@time-tracker/shared';
import { useEffect, useState } from 'react';
import { getProfile } from '@/lib/api/profile';

type UseProfileResult = {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
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

  return { profile, isLoading, error };
}

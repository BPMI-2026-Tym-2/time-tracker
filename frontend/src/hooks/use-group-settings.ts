'use client';

import { useCallback, useEffect, useState } from 'react';
import type { GroupSettingsResponse, UpdateGroupSettingsBody } from '@time-tracker/shared';
import { fetchGroupSettings, updateGroupSettings } from '@/lib/api/groups';

export type UseGroupSettingsResult = {
  settings: GroupSettingsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateSettings: (body: UpdateGroupSettingsBody) => Promise<boolean>;
};

export function useGroupSettings(groupId: string): UseGroupSettingsResult {
  const [settings, setSettings] = useState<GroupSettingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGroupSettings(groupId);
      setSettings(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Nastala neočekávaná chyba při načítání nastavení skupiny');
      }
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    let ignore = false;

    async function startFetch() {
      if (!groupId) return;
      try {
        const data = await fetchGroupSettings(groupId);
        if (!ignore) {
          setSettings(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Nastala neočekávaná chyba při načítání nastavení skupiny');
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void startFetch();

    return () => {
      ignore = true;
    };
  }, [groupId]);

  const update = useCallback(
    async (body: UpdateGroupSettingsBody) => {
      if (!groupId) return false;
      try {
        const updated = await updateGroupSettings(groupId, body);
        setSettings(updated);
        return true;
      } catch {
        return false;
      }
    },
    [groupId],
  );

  return {
    settings,
    isLoading,
    error,
    refetch: loadSettings,
    updateSettings: update,
  };
}

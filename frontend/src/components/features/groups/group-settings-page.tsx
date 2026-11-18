'use client';

import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert } from 'lucide-react';
import { GroupSettingsForm } from './group-settings-form';
import { InviteMemberDialog } from './invite-member-dialog';
import { useOrganizationSettings } from '@/hooks/use-organization-settings';
import { ApiError } from '@/lib/api/organizations';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { organizationSchema, type UpdateOrganizationSettingsRequest } from '@time-tracker/shared';

type GroupSettingsPageProps = {
  groupId: string;
};

export function GroupSettingsPage({ groupId }: GroupSettingsPageProps) {
  const router = useRouter();
  const {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings,
    isUpdating,
    updateError,
    resetUpdateError,
  } = useOrganizationSettings(groupId);

  const form = useForm<UpdateOrganizationSettingsRequest>({
    resolver: zodResolver(organizationSchema.updateOrganizationSettingsRequest),
    values: settings
      ? {
          name: settings.name,
          description: settings.description ?? '',
        }
      : undefined,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit: SubmitHandler<UpdateOrganizationSettingsRequest> = async (data) => {
    resetUpdateError();
    await updateSettings(data);
  };

  const isUnauthorized = error instanceof ApiError && error.statusCode === 401;
  const isForbidden = error instanceof ApiError && error.statusCode === 403;

  return (
    <main className="flex flex-1 flex-col justify-start p-6 md:p-10">
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="text-primary size-8" />
        </div>
      )}

      {!isLoading && isUnauthorized && (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="border-border bg-card w-full max-w-md space-y-4 rounded-3xl border p-8 text-center shadow-sm">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
              <ShieldAlert className="size-6" />
            </div>
            <h2 className="text-xl font-bold">Přihlášení vyžadováno</h2>
            <p className="text-muted-foreground text-sm">
              Pro zobrazení nastavení skupiny se musíte nejprve přihlásit do svého účtu.
            </p>
            <Button variant="default" onClick={() => router.push('/login')}>
              Přejít na přihlášení
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !isUnauthorized && isForbidden && (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="border-border bg-card w-full max-w-md space-y-4 rounded-3xl border p-8 text-center shadow-sm">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
              <ShieldAlert className="size-6" />
            </div>
            <h2 className="text-xl font-bold">Přístup odepřen</h2>
            <p className="text-muted-foreground text-sm">
              K zobrazení a úpravě nastavení této skupiny nemáte dostatečná oprávnění. Tuto akci
              může provádět pouze vlastník skupiny.
            </p>
            <Button variant="outline" onClick={() => router.push('/groups')}>
              Zpět na seznam skupin
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !isUnauthorized && !isForbidden && (error || !settings) && (
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="border-border bg-card w-full max-w-md space-y-4 rounded-3xl border p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Skupina není dostupná</h2>
            <p className="text-muted-foreground text-sm">
              {error?.message ?? 'Vybraná skupina již není dostupná nebo k ní nemáte přístup.'}
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => router.push('/groups')}>
                Zpět na seznam skupin
              </Button>
              <Button variant="default" onClick={() => void refetch()}>
                Zkusit znovu
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isLoading && settings && (
        <div className="border-border bg-card mx-auto w-full max-w-4xl space-y-6 rounded-3xl border p-6 shadow-sm sm:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nastavení skupiny</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Správa základních informací o skupině {settings.name}
              </p>
            </div>
            <InviteMemberDialog organizationId={settings.id} organizationName={settings.name} />
          </div>

          <GroupSettingsForm
            form={form}
            settings={settings}
            onSubmit={onSubmit}
            isPending={isUpdating}
            errorMessage={updateError?.message}
          />
        </div>
      )}
    </main>
  );
}

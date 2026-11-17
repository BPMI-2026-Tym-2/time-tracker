'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert } from 'lucide-react';
import { SettingsSidebar } from './settings-sidebar';
import { GroupSettingsForm } from './group-settings-form';
import { useOrganizationSettings } from '@/hooks/use-organization-settings';
import { ApiError } from '@/lib/api/organizations';
import { Spinner } from '@/components/ui/spinner';
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
import { organizationSchema, type UpdateOrganizationSettingsRequest } from '@time-tracker/shared';

type GroupSettingsPageProps = {
  groupId: string;
};

export function GroupSettingsPage({ groupId }: GroupSettingsPageProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    settings,
    isLoading,
    error,
    refetch,
    updateSettings,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteOrganization,
    isDeleting,
  } = useOrganizationSettings(groupId);

  const form = useForm<UpdateOrganizationSettingsRequest>({
    resolver: zodResolver(organizationSchema.updateOrganizationSettingsRequest),
    values: settings ? { name: settings.name } : undefined,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit: SubmitHandler<UpdateOrganizationSettingsRequest> = async (data) => {
    resetUpdateError();
    await updateSettings(data);
  };

  async function handleDelete() {
    await deleteOrganization();
    router.push('/');
  }

  const isForbidden = error instanceof ApiError && error.statusCode === 403;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SettingsSidebar />

      <main className="flex flex-1 flex-col justify-start p-6 md:p-10">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="text-primary size-8" />
          </div>
        )}

        {!isLoading && isForbidden && (
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
              <Button variant="outline" onClick={() => router.push('/')}>
                Zpět na přehled
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !isForbidden && (error || !settings) && (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="border-border bg-card w-full max-w-md space-y-4 rounded-3xl border p-8 text-center shadow-sm">
              <h2 className="text-xl font-bold">Chyba při načítání</h2>
              <p className="text-muted-foreground text-sm">
                {error?.message ?? 'Nastavení skupiny se nepodařilo načíst.'}
              </p>
              <Button variant="outline" onClick={() => void refetch()}>
                Zkusit znovu
              </Button>
            </div>
          </div>
        )}

        {!isLoading && settings && (
          <div className="border-border bg-card mx-auto w-full max-w-4xl space-y-6 rounded-3xl border p-6 shadow-sm sm:p-10">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nastavení skupiny</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Správa základních informací o skupině {settings.name}
              </p>
            </div>

            <GroupSettingsForm
              form={form}
              settings={settings}
              onSubmit={onSubmit}
              isPending={isUpdating}
              errorMessage={updateError?.message}
              onDeleteClick={() => setShowDeleteDialog(true)}
            />
          </div>
        )}

        {settings && (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Odstranit skupinu?</AlertDialogTitle>
                <AlertDialogDescription>
                  Opravdu si přejete trvale odstranit skupinu{' '}
                  <strong className="text-foreground font-semibold">{settings.name}</strong>? Tato
                  akce je nevratná.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Zrušit</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => void handleDelete()}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Odstraňuji...' : 'Odstranit'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </main>
    </div>
  );
}

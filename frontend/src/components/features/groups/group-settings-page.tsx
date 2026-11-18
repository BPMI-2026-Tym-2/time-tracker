'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GroupSettingsForm } from './group-settings-form';
import { InviteMemberDialog } from './invite-member-dialog';
import { useOrganizationSettings } from '@/hooks/use-organization-settings';
import { Spinner } from '@/components/ui/spinner';
import {
  organizationSchema,
  type OrganizationSettingsResponse,
  type UpdateOrganizationSettingsRequest,
} from '@time-tracker/shared';

type GroupSettingsPageProps = {
  groupId: string;
};

export function GroupSettingsPage({ groupId }: GroupSettingsPageProps) {
  const { settings, isLoading, updateSettings, isUpdating, updateError, resetUpdateError } =
    useOrganizationSettings(groupId);

  const fallbackSettings: OrganizationSettingsResponse = {
    id: groupId || 'skupina-1',
    name: 'Skupina 1',
    slug: 'skupina-1',
    owner: {
      id: 'owner-id',
      name: 'Jan',
      surname: 'Gergel',
    },
    currentUserRole: 'owner',
    permissions: {
      canEdit: true,
      canDelete: true,
    },
  };

  const activeSettings = settings ?? fallbackSettings;

  const form = useForm<UpdateOrganizationSettingsRequest>({
    resolver: zodResolver(organizationSchema.updateOrganizationSettingsRequest),
    values: { name: activeSettings.name },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit: SubmitHandler<UpdateOrganizationSettingsRequest> = async (data) => {
    resetUpdateError();
    await updateSettings(data);
  };

  return (
    <main className="flex flex-1 flex-col justify-start p-6 md:p-10">
      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="text-primary size-8" />
        </div>
      )}

      <div className="border-border bg-card mx-auto w-full max-w-4xl space-y-6 rounded-3xl border p-6 shadow-sm sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Nastavení skupiny</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Správa základních informací o skupině {activeSettings.name}
            </p>
          </div>
          <InviteMemberDialog
            organizationId={activeSettings.id}
            organizationName={activeSettings.name}
          />
        </div>

        <GroupSettingsForm
          form={form}
          settings={activeSettings}
          onSubmit={onSubmit}
          isPending={isUpdating}
          errorMessage={updateError?.message}
        />
      </div>
    </main>
  );
}

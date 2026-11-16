import { Suspense } from 'react';
import { GroupSettingsPage } from '@/components/features/groups/group-settings-page';
import { Spinner } from '@/components/ui/spinner';

type SettingsPageProps = {
  params: Promise<{ groupId: string }>;
};

async function SettingsContent({ params }: SettingsPageProps) {
  const { groupId } = await params;
  return <GroupSettingsPage groupId={groupId} />;
}

export default function SettingsPage({ params }: SettingsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Spinner className="text-primary size-8" />
        </div>
      }
    >
      <SettingsContent params={params} />
    </Suspense>
  );
}

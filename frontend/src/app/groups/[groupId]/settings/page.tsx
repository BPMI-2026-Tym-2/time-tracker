import { Suspense } from 'react';
import { GroupSettingsPage } from '@/components/features/groups/group-settings-page';

type PageProps = {
  params: Promise<{ groupId: string }>;
};

async function SettingsContent({ params }: PageProps) {
  const { groupId } = await params;
  return <GroupSettingsPage groupId={groupId} />;
}

export default function SettingsPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          <div className="bg-muted h-10 w-48 animate-pulse rounded-md" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-card border-border/80 h-48 animate-pulse rounded-2xl border" />
            <div className="bg-card border-border/80 h-48 animate-pulse rounded-2xl border" />
          </div>
        </div>
      }
    >
      <SettingsContent params={params} />
    </Suspense>
  );
}

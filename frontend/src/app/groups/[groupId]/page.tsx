import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

type PageProps = {
  params: Promise<{ groupId: string }>;
};

async function OverviewRedirect({ params }: PageProps) {
  const { groupId } = await params;
  redirect(`/groups/${groupId}/settings`);
  return null;
}

export default function GroupOverviewPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Spinner className="text-primary size-8" />
        </div>
      }
    >
      <OverviewRedirect params={params} />
    </Suspense>
  );
}

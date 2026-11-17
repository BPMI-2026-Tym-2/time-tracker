import { Suspense } from 'react';
import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ groupId: string }>;
};

async function RedirectToSettings({ params }: PageProps) {
  const { groupId } = await params;
  redirect(`/groups/${groupId}/settings`);
  return null;
}

export default function GroupOverviewPage({ params }: PageProps) {
  return (
    <Suspense fallback={null}>
      <RedirectToSettings params={params} />
    </Suspense>
  );
}

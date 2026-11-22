import { Suspense } from 'react';
import { GroupDetail } from '@/components/features/groups/group-detail';
import { Spinner } from '@/components/ui/spinner';

type GroupDetailPageProps = {
  params: Promise<{ groupId: string }>;
};

async function GroupDetailContent({ params }: GroupDetailPageProps) {
  const { groupId } = await params;
  return <GroupDetail groupId={groupId} />;
}

export default function GroupDetailPage({ params }: GroupDetailPageProps) {
  return (
    <main className="flex flex-1 flex-col justify-start p-6 md:p-8">
      <div className="mx-auto w-full max-w-5xl">
        <Suspense
          fallback={
            <div className="flex min-h-64 items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <GroupDetailContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}

import { Suspense } from 'react';
import { GroupMembers } from '@/components/features/groups/group-members';
import { Spinner } from '@/components/ui/spinner';

async function MembersContent({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  return <GroupMembers key={groupId} groupId={groupId} />;
}

export default function MembersPage({ params }: { params: Promise<{ groupId: string }> }) {
  return (
    <main className="flex-1 bg-[#f5f7f9] p-4 sm:p-8">
      <Suspense fallback={<Spinner aria-label="Načítám seznam uživatelů" />}>
        <MembersContent params={params} />
      </Suspense>
    </main>
  );
}

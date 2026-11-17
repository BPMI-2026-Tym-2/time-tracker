import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function GroupOverviewPage({ params }: PageProps) {
  const { groupId } = await params;
  redirect(`/groups/${groupId}/settings`);
}

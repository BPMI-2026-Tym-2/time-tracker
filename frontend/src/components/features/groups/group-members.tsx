'use client';

import { useDeferredValue, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowDownWideNarrow, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { ListOrganizationMembersQuery } from '@time-tracker/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useOrganization } from '@/hooks/use-organization';
import { ApiError, fetchOrganizationMembers } from '@/lib/api/organizations';
import { authClient } from '@/lib/auth-client';
import { InviteMemberDialog } from './invite-member-dialog';

const pageSize = 7;
const roleLabels = { owner: 'Vlastník', member: 'Člen' };

export function GroupMembers({ groupId }: { groupId: string }) {
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const organization = useOrganization(groupId);
  const isOwner = organization.data?.currentUserRole === 'owner';
  const [input, setInput] = useState('');
  const [role, setRole] = useState<ListOrganizationMembersQuery['role']>();
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const search = useDeferredValue(input.trim());
  const query = { search: search || undefined, role, sort, page, pageSize };
  const members = useQuery({
    queryKey: ['organizations', groupId, 'members', userId, query],
    queryFn: ({ signal }) => fetchOrganizationMembers(groupId, query, signal),
    enabled: Boolean(userId),
    retry: false,
  });
  const total = members.data?.pageInfo.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="bg-card border-border mx-auto w-full rounded-2xl border p-4 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/groups/${groupId}`}
            className="text-muted-foreground text-sm hover:underline"
          >
            Zpět na detail skupiny
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Seznam uživatelů</h1>
        </div>
        {userId && isOwner && organization.data && (
          <InviteMemberDialog organizationId={groupId} organizationName={organization.data.name} />
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-48 flex-1">
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Input
            type="search"
            aria-label="Hledat podle jména nebo e-mailu"
            placeholder="Jméno / e-mail…"
            className="h-11 pl-9"
            maxLength={200}
            value={input}
            onChange={(event) => {
              setInput(event.currentTarget.value);
              setPage(1);
            }}
          />
        </div>
        <select
          aria-label="Role ve skupině"
          className="border-border bg-background h-11 rounded-lg border px-3 text-sm"
          value={role ?? ''}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setRole(value === 'owner' || value === 'member' ? value : undefined);
            setPage(1);
          }}
        >
          <option value="">Všechny role</option>
          <option value="owner">Vlastník</option>
          <option value="member">Člen</option>
        </select>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => {
            setSort((current) => (current === 'newest' ? 'oldest' : 'newest'));
            setPage(1);
          }}
        >
          <ArrowDownWideNarrow aria-hidden="true" />
          Řazení: {sort === 'newest' ? 'nejnovější vstupy' : 'nejstarší vstupy'}
        </Button>
      </div>

      {session.isPending || (userId && members.isPending) ? (
        <div role="status" className="flex justify-center p-8">
          <Spinner aria-label="Načítám seznam uživatelů" />
        </div>
      ) : !userId || members.isError ? (
        <div className="space-y-3 py-6">
          <p role="alert" className="text-destructive text-sm">
            {!userId
              ? 'Pro zobrazení členů se přihlaste.'
              : members.error instanceof ApiError && members.error.statusCode === 403
                ? 'Seznam mohou zobrazit pouze členové skupiny.'
                : 'Seznam uživatelů se nepodařilo načíst.'}
          </p>
          {userId && (
            <Button variant="outline" onClick={() => void members.refetch()}>
              Zkusit znovu
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="border-border overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[30rem] text-left text-sm">
              <thead className="bg-[#f5f7f9] text-[#1b2837]">
                <tr>
                  <th scope="col" className="w-1/4 px-4 py-4 font-semibold">
                    Uživatel
                  </th>
                  <th scope="col" className="w-1/2 px-4 py-4 font-semibold">
                    E-mail
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y border-t">
                {members.data?.items.map((member) => (
                  <tr key={member.id}>
                    <th scope="row" className="px-4 py-4 font-semibold">
                      {member.name} {member.surname}
                    </th>
                    <td className="text-muted-foreground px-4 py-4 wrap-anywhere">
                      {member.email ?? '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${member.role === 'owner' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {roleLabels[member.role]}
                      </span>
                    </td>
                  </tr>
                ))}
                {!members.data?.items.length && (
                  <tr>
                    <td colSpan={3} className="text-muted-foreground px-4 py-8 text-center">
                      {page > lastPage
                        ? 'Na této stránce nejsou žádní uživatelé.'
                        : 'Žádní odpovídající uživatelé.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p>
              Počet uživatelů: <strong>{total}</strong>
            </p>
            <nav aria-label="Stránkování seznamu uživatelů" className="flex items-center gap-2">
              <span className="mr-2" aria-live="polite">
                Stránka {Math.min(page, lastPage)} z {lastPage}
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Předchozí stránka"
                disabled={page <= 1}
                onClick={() => setPage(Math.min(page - 1, lastPage))}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Další stránka"
                disabled={page >= lastPage}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </nav>
          </div>
        </>
      )}
    </section>
  );
}

'use client';

import { Users, UserPlus, Crown, ChevronDown, Trash2 } from 'lucide-react';
import type { GroupMemberResponse, GroupRole } from '@time-tracker/shared';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type MembersCardProps = {
  members: GroupMemberResponse[];
  setMembers: React.Dispatch<React.SetStateAction<GroupMemberResponse[]>>;
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  onOpenInvite: () => void;
  onRequestDeleteMember: (member: GroupMemberResponse) => void;
};

export function MembersCard({
  members,
  setMembers,
  isLoading,
  error,
  canEdit,
  onOpenInvite,
  onRequestDeleteMember,
}: MembersCardProps) {
  function handleRoleChange(memberId: string, newRole: GroupRole) {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
  }

  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pt-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            <CardTitle className="text-sm font-semibold text-slate-900">Členové skupiny</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Spravujte členy skupiny a jejich role.
          </CardDescription>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={onOpenInvite}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <UserPlus className="h-3.5 w-3.5 text-slate-500" />
            <span>Pozvat člena</span>
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-2 pt-1 pb-5">
        {isLoading ? (
          <div className="space-y-1.5 py-1">
            <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.length > 0 ? (
              members.map((member) => {
                const isOwner = member.role === 'owner';
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Users className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-900">
                          <span>
                            {member.name} {member.surname}
                          </span>
                          {isOwner && <Crown className="h-2.5 w-2.5 text-amber-500" />}
                        </div>
                        {isOwner && <span className="text-[10px] text-slate-400">Vlastník</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOwner ? (
                        <div className="flex h-6 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-medium text-slate-700">
                          Vlastník
                        </div>
                      ) : canEdit ? (
                        <div className="relative">
                          <select
                            value={member.role === 'admin' ? 'Administrátor' : 'Člen'}
                            onChange={(e) => {
                              const newRole =
                                e.target.value === 'Administrátor' ? 'admin' : 'member';
                              handleRoleChange(member.id, newRole);
                            }}
                            className="h-6 appearance-none rounded-md border border-slate-200 bg-white pr-6 pl-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="Administrátor">Administrátor</option>
                            <option value="Člen">Člen</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-slate-400" />
                        </div>
                      ) : (
                        <div className="flex h-6 items-center rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-700">
                          {member.role === 'admin' ? 'Administrátor' : 'Člen'}
                        </div>
                      )}
                      {!isOwner && canEdit && (
                        <button
                          type="button"
                          onClick={() => onRequestDeleteMember(member)}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title={`Odstranit člena ${member.name} ${member.surname}`}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-2 text-xs text-slate-500">Žádní členové nenalezeni</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

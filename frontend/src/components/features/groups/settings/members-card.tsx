'use client';

import { Users, User, Crown, ChevronDown, Trash2 } from 'lucide-react';
import type { GroupMemberResponse, GroupRole } from '@time-tracker/shared';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type MembersCardProps = {
  members: GroupMemberResponse[];
  setMembers: React.Dispatch<React.SetStateAction<GroupMemberResponse[]>>;
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  onOpenInvite?: () => void;
  onRequestDeleteMember: (member: GroupMemberResponse) => void;
};

export function MembersCard({
  members,
  setMembers,
  isLoading,
  error,
  canEdit,
  onRequestDeleteMember,
}: MembersCardProps) {
  function handleRoleChange(memberId: string, newRole: GroupRole) {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
  }

  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="px-6 pt-4 pb-1.5">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />
          <CardTitle className="text-sm font-semibold text-slate-900">Členové skupiny</CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500">
          Spravujte členy skupiny a jejich role.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 px-6 pt-1 pb-6">
        {isLoading ? (
          <div className="space-y-2 py-1">
            <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ) : error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          <div className="space-y-3 pt-1">
            {members.length > 0 ? (
              members.map((member) => {
                const isOwner = member.role === 'owner';
                return (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-900">
                          <span>
                            {member.name} {member.surname}
                          </span>
                          {isOwner && <Crown className="h-3 w-3 text-amber-500" />}
                        </div>
                        {isOwner && <span className="text-[10px] text-slate-400">Vlastník</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOwner ? (
                        <div className="relative">
                          <button
                            type="button"
                            disabled
                            className="flex h-7 min-w-[100px] items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700"
                          >
                            <span>Vlastník</span>
                            <ChevronDown className="h-3 w-3 text-slate-400" />
                          </button>
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
                            className="h-7 min-w-[110px] appearance-none rounded-lg border border-slate-200 bg-white pr-7 pl-2.5 text-xs font-normal text-slate-700 hover:bg-slate-50 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="Administrátor">Administrátor</option>
                            <option value="Člen">Člen</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                        </div>
                      ) : (
                        <div className="flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700">
                          {member.role === 'admin' ? 'Administrátor' : 'Člen'}
                        </div>
                      )}
                      {!isOwner && canEdit && (
                        <button
                          type="button"
                          onClick={() => onRequestDeleteMember(member)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                          title={`Odstranit člena ${member.name} ${member.surname}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

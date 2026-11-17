'use client';

import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Code,
  Dumbbell,
  Plane,
  Gamepad2,
  Users,
  MoreVertical,
  Settings,
  ExternalLink,
} from 'lucide-react';
import type { OrganizationItemResponse } from '@time-tracker/shared';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type GroupTableProps = {
  groups: OrganizationItemResponse[];
  onOpenGroup?: (groupId: string) => void;
};

const VISUAL_BY_SLUG: Record<string, { icon: LucideIcon; boxClass: string }> = {
  programovani: { icon: Code, boxClass: 'bg-[#E5F1E2] text-[#29562E]' },
  'fitness-a-zdravi': { icon: Dumbbell, boxClass: 'bg-[#E5F1E2] text-[#29562E]' },
  cestovani: { icon: Plane, boxClass: 'bg-[#FCF2DF] text-[#9D6824]' },
  gaming: { icon: Gamepad2, boxClass: 'bg-[#E5F1E2] text-[#29562E]' },
};

function getGroupVisual(slug: string) {
  return VISUAL_BY_SLUG[slug] ?? { icon: Users, boxClass: 'bg-[#E5F1E2] text-[#29562E]' };
}

export function GroupTable({ groups, onOpenGroup }: GroupTableProps) {
  const router = useRouter();

  if (groups.length === 0) {
    return null;
  }

  function handleOpen(groupId: string) {
    if (onOpenGroup) {
      onOpenGroup(groupId);
    } else {
      router.push(`/groups/${groupId}`);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#EBE6DE] bg-white shadow-2xs">
      <div className="grid grid-cols-[1fr_130px_70px] items-center bg-[#F3EFE9] px-6 py-3.5 text-sm font-bold text-[#163820]">
        <div>Název skupiny</div>
        <div className="text-center">Role</div>
        <div className="text-right">Akce</div>
      </div>

      <div className="divide-y divide-[#ECE8E1]/70">
        {groups.map((group) => {
          const { icon: GroupIcon, boxClass } = getGroupVisual(group.slug);
          const isOwner = group.role === 'owner';

          return (
            <div
              key={group.id}
              className="grid grid-cols-[1fr_130px_70px] items-center px-6 py-3 transition-colors hover:bg-slate-50/60"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl font-bold ${boxClass}`}
                >
                  <GroupIcon className="size-5 stroke-[2.5]" />
                </div>
                <button
                  type="button"
                  onClick={() => handleOpen(group.id)}
                  className="cursor-pointer text-left text-base font-bold text-[#163820] hover:underline"
                >
                  {group.name}
                </button>
              </div>

              <div className="text-center">
                <span
                  className={`inline-flex items-center justify-center rounded-full px-5 py-1 text-xs font-bold ${
                    isOwner ? 'bg-[#DCEDD9] text-[#245228]' : 'bg-[#F1ECE5] text-[#52493F]'
                  }`}
                >
                  {isOwner ? 'Vlastník' : 'Člen'}
                </span>
              </div>

              <div className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Možnosti pro skupinu ${group.name}`}
                        className="text-[#163820] hover:bg-slate-100"
                      >
                        <MoreVertical className="size-5" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleOpen(group.id)}>
                      <ExternalLink className="size-4" />
                      <span>Otevřít přehled</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/groups/${group.id}/settings`)}>
                      <Settings className="size-4" />
                      <span>Zobrazit nastavení</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

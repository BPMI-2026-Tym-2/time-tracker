'use client';

import { useRouter } from 'next/navigation';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

function getGroupIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('prog') || lower.includes('kód') || lower.includes('dev')) {
    return {
      icon: Code,
      className: 'bg-[#EAF3E7] text-[#2D5A34]',
    };
  }
  if (lower.includes('fit') || lower.includes('zdrav') || lower.includes('sport')) {
    return {
      icon: Dumbbell,
      className: 'bg-[#EAF3E7] text-[#2D5A34]',
    };
  }
  if (lower.includes('cest') || lower.includes('trip') || lower.includes('dovolen')) {
    return {
      icon: Plane,
      className: 'bg-[#FDF4E7] text-[#A66E28]',
    };
  }
  if (lower.includes('gam') || lower.includes('hr')) {
    return {
      icon: Gamepad2,
      className: 'bg-[#EAF3E7] text-[#2D5A34]',
    };
  }
  return {
    icon: Users,
    className: 'bg-[#EAF3E7] text-[#2D5A34]',
  };
}

export function GroupTable({ groups, onOpenGroup }: GroupTableProps) {
  const router = useRouter();

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="border-border/60 bg-card overflow-hidden rounded-2xl border shadow-xs">
      <Table>
        <TableHeader className="dark:bg-muted/40 bg-[#F4EFEB]">
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="text-foreground w-1/2 py-3.5 pl-6 text-xs font-semibold">
              Název skupiny
            </TableHead>
            <TableHead className="text-foreground py-3.5 text-center text-xs font-semibold">
              Role
            </TableHead>
            <TableHead className="text-foreground py-3.5 pr-6 text-right text-xs font-semibold">
              Akce
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-border/40 divide-y">
          {groups.map((group) => {
            const { icon: GroupIcon, className: iconStyle } = getGroupIcon(group.name);
            const isOwner = group.role === 'owner';

            return (
              <TableRow key={group.id} className="hover:bg-muted/20 transition-colors">
                <TableCell className="py-3 pl-6">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl ${iconStyle}`}
                    >
                      <GroupIcon className="size-5" />
                    </div>
                    <span className="text-foreground text-sm font-semibold">{group.name}</span>
                  </div>
                </TableCell>

                <TableCell className="py-3 text-center">
                  {isOwner ? (
                    <span className="inline-flex items-center rounded-full bg-[#DDECDA] px-4 py-1 text-xs font-semibold text-[#22572A]">
                      Vlastník
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-[#F1ECE6] px-4 py-1 text-xs font-medium text-[#4A433B]">
                      Člen
                    </span>
                  )}
                </TableCell>

                <TableCell className="py-3 pr-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Možnosti pro skupinu ${group.name}`}
                          className="text-foreground hover:bg-muted"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          if (onOpenGroup) {
                            onOpenGroup(group.id);
                          } else {
                            router.push(`/groups/${group.id}`);
                          }
                        }}
                      >
                        <ExternalLink className="size-4" />
                        <span>Otevřít přehled</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/groups/${group.id}/settings`)}>
                        <Settings className="size-4" />
                        <span>Zobrazit nastavení</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

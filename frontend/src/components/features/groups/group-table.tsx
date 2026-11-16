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
      className: 'bg-blue-100 text-blue-600',
    };
  }
  if (lower.includes('fit') || lower.includes('zdrav') || lower.includes('sport')) {
    return {
      icon: Dumbbell,
      className: 'bg-sky-100 text-sky-600',
    };
  }
  if (lower.includes('cest') || lower.includes('trip') || lower.includes('dovolen')) {
    return {
      icon: Plane,
      className: 'bg-amber-100 text-amber-600',
    };
  }
  if (lower.includes('gam') || lower.includes('hr')) {
    return {
      icon: Gamepad2,
      className: 'bg-purple-100 text-purple-600',
    };
  }
  return {
    icon: Users,
    className: 'bg-primary/10 text-primary',
  };
}

export function GroupTable({ groups, onOpenGroup }: GroupTableProps) {
  const router = useRouter();

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-2/3 py-4 text-xs font-semibold">Název skupiny</TableHead>
            <TableHead className="py-4 text-center text-xs font-semibold">Role</TableHead>
            <TableHead className="py-4 text-right text-xs font-semibold">Akce</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-border divide-y">
          {groups.map((group) => {
            const { icon: GroupIcon, className: iconStyle } = getGroupIcon(group.name);
            const isOwner = group.role === 'owner';

            return (
              <TableRow key={group.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="py-3">
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
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold text-blue-700">
                      Vlastník
                    </span>
                  ) : (
                    <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-4 py-1 text-xs font-medium">
                      Člen
                    </span>
                  )}
                </TableCell>

                <TableCell className="py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Možnosti pro skupinu ${group.name}`}
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

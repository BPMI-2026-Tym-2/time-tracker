'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Users, MoreVertical, Settings, ExternalLink } from 'lucide-react';
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

export function GroupTable({ groups, onOpenGroup }: GroupTableProps) {
  const router = useRouter();

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40">
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
            const isOwner = group.role === 'owner';

            return (
              <TableRow key={group.id} className="hover:bg-muted/20 transition-colors">
                <TableCell className="py-3 pl-6">
                  <div className="flex items-center gap-3.5">
                    <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl font-semibold">
                      {group.logo ? (
                        <Image
                          src={group.logo}
                          alt={group.name}
                          width={40}
                          height={40}
                          className="size-10 rounded-xl object-cover"
                          unoptimized
                        />
                      ) : (
                        <Users className="size-5" />
                      )}
                    </div>
                    <span className="text-foreground text-sm font-semibold">{group.name}</span>
                  </div>
                </TableCell>

                <TableCell className="py-3 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-4 py-1 text-xs ${
                      isOwner
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'bg-muted text-muted-foreground font-medium'
                    }`}
                  >
                    {isOwner ? 'Vlastník' : 'Člen'}
                  </span>
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

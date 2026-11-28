'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { LogOut, Trash2, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/toast';
import { DeleteAccountDialog } from '@/components/features/users/components/user-delete-account-dialog-button';
import { useLogout } from '@/hooks/use-logout';
import { authClient } from '@/lib/auth-client';

export function AccountMenu() {
  const { data: session } = authClient.useSession();
  const { logout, isPending: isLoggingOut } = useLogout();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const user = session?.user;

  if (!user) {
    return (
      <Button
        render={<Link href="/myaccount" />}
        nativeButton={false}
        variant="outline"
        size="icon"
        aria-label="Můj účet"
      >
        <UserRound aria-hidden="true" />
      </Button>
    );
  }

  const fullName = [user.name, user.surname].filter(Boolean).join(' ');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              ref={triggerRef}
              variant="outline"
              size="icon"
              className="border-2 border-[#163820] p-0 text-[#163820]"
            />
          }
          aria-label={`Nabídka účtu – ${fullName}`}
        >
          <Avatar className="size-full">
            {user.image && <AvatarImage src={user.image} alt="" />}
            <AvatarFallback className="bg-[#e3efdf] text-[#163820]">
              <UserRound aria-hidden="true" className="size-4" />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={10}
          finalFocus={deleteOpen ? false : triggerRef}
          className="w-80 max-w-[calc(100vw-2rem)] space-y-1 rounded-2xl p-2.5 shadow-xl"
        >
          <div className="mb-2 flex items-center gap-3 border-b px-2 pt-1.5 pb-3">
            <Avatar className="size-12">
              {user.image && <AvatarImage src={user.image} alt="" />}
              <AvatarFallback className="bg-[#e3efdf] text-[#163820]">
                <UserRound aria-hidden="true" className="size-6" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-foreground text-base font-bold wrap-anywhere">{fullName}</p>
              <p className="text-muted-foreground text-sm wrap-anywhere">{user.email}</p>
            </div>
          </div>

          <DropdownMenuItem
            render={<Link href="/myaccount" />}
            disabled={isLoggingOut}
            className="min-h-10 cursor-pointer rounded-xl"
          >
            <UserRound aria-hidden="true" />
            Upravit účet
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isLoggingOut}
            className="min-h-10 cursor-pointer rounded-xl"
            onClick={() =>
              logout(undefined, {
                onError: (error) =>
                  toast.add({ title: 'Odhlášení se nepodařilo', description: error.message }),
              })
            }
          >
            <LogOut aria-hidden="true" />
            Odhlásit se
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={isLoggingOut}
            className="border-destructive/25 bg-destructive/5 min-h-10 cursor-pointer rounded-xl border"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 aria-hidden="true" />
            Odstranit účet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {deleteOpen && (
        <DeleteAccountDialog
          userId={user.id}
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) triggerRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

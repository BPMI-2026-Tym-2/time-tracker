'use client';

import { useState } from 'react';
import { Trash2Icon } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteAccount } from '@/hooks/use-delete-account';

export function DeleteAccountDialog({
  userId,
  open,
  onOpenChange,
}: {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [deleted, setDeleted] = useState(false);
  const { deleteAccount, isDeleting, error } = useDeleteAccount();

  async function handleDelete() {
    if (await deleteAccount(userId)) {
      setDeleted(true);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isDeleting) return;
        if (!nextOpen && deleted) {
          window.location.replace('/login');
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent size="sm">
        {deleted ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Účet byl úspěšně odstraněn</AlertDialogTitle>
              <AlertDialogDescription>
                Váš účet a osobní údaje byly odstraněny.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="group-data-[size=sm]/alert-dialog-content:grid-cols-1 sm:justify-center sm:justify-items-center">
              <AlertDialogCancel className="w-full justify-center sm:w-auto sm:min-w-48">
                Zpět na přihlašovací stránku
              </AlertDialogCancel>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <Trash2Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>Odstranit účet?</AlertDialogTitle>
              <AlertDialogDescription>
                Tato akce je nevratná. Váš účet, osobní údaje a přístup do aplikace budou trvale
                smazány.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Zrušit</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
              >
                {isDeleting ? 'Odstraňuji...' : 'Odstranit'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, RotateCcw, UserPlus } from 'lucide-react';
import { organizationSchema, type CreateInvitationRequest } from '@time-tracker/shared';
import { useCreateInvitation } from '@/hooks/use-invitations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type InviteMemberDialogProps = {
  organizationId: string;
  organizationName?: string;
  trigger?: React.ReactNode;
  onSuccess?: (email: string) => void;
};

export function InviteMemberDialog({
  organizationId,
  organizationName = 'Skupina 1',
  trigger,
  onSuccess,
}: InviteMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    mutateAsync: sendInvite,
    isPending,
    error: apiError,
    reset: resetMutation,
  } = useCreateInvitation(organizationId);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<CreateInvitationRequest>({
    resolver: zodResolver(organizationSchema.createInvitationRequest),
    defaultValues: {
      email: '',
    },
    mode: 'onSubmit',
  });

  async function onSubmit(data: CreateInvitationRequest) {
    setSuccessMessage(null);
    try {
      await sendInvite(data);
      setSuccessMessage(`Pozvánka byla odeslána na ${data.email}.`);
      resetForm();
      onSuccess?.(data.email);
    } catch {
      // Handled via mutation state
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      resetForm();
      resetMutation();
      setSuccessMessage(null);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button type="button" className="gap-2">
              <UserPlus className="size-4" />
              <span>Pozvat člena</span>
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl font-bold tracking-tight">Pozvat člena</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Pozvěte nového člena do skupiny{' '}
            <strong className="text-foreground">&quot;{organizationName}&quot;</strong>!
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <div className="space-y-4 py-2">
            <div className="border-border bg-muted/40 flex flex-col items-center gap-2 rounded-2xl border p-5 text-center">
              <CheckCircle2 className="size-8 text-emerald-600" />
              <p className="text-foreground text-sm font-semibold">Pozvánka byla odeslána</p>
              <p className="text-muted-foreground text-xs">{successMessage}</p>
            </div>

            <DialogFooter className="sm:justify-center">
              <DialogClose render={<Button type="button" />}>Zavřít</DialogClose>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2" noValidate>
            <div className="space-y-2 text-center">
              <label
                htmlFor="invitation-email-input"
                className="text-foreground block text-sm font-medium"
              >
                Vložte E-mail uživatele:
              </label>

              <Input
                id="invitation-email-input"
                type="email"
                placeholder="daniel@seznam.cz"
                disabled={isPending}
                aria-invalid={Boolean(errors.email)}
                className="bg-muted/40 h-10 text-center"
                {...register('email')}
              />

              {errors.email && (
                <p className="text-destructive text-xs font-semibold" role="alert">
                  {errors.email.message || 'Zadejte platnou e-mailovou adresu.'}
                </p>
              )}
            </div>

            {apiError && (
              <div className="border-destructive/20 bg-destructive/10 text-destructive flex flex-col items-center gap-1 rounded-xl border p-3 text-center text-xs">
                <p className="font-semibold">Pozvánku se nepodařilo odeslat</p>
                <p className="text-muted-foreground text-[11px]">
                  Zkontrolujte připojení a zkuste to prosím znovu.
                </p>
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  className="mt-1 inline-flex items-center gap-1 font-semibold underline hover:no-underline"
                >
                  <RotateCcw className="size-3" />
                  <span>Zkusit znovu</span>
                </button>
              </div>
            )}

            <DialogFooter className="flex-row justify-center gap-3 sm:justify-center">
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="min-w-24"
                    disabled={isPending}
                  />
                }
              >
                Zavřít
              </DialogClose>

              <Button type="submit" className="min-w-24" disabled={isPending}>
                {isPending ? 'Odesílám...' : 'Pozvat'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

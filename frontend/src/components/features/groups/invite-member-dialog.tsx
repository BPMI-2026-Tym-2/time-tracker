'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { organizationSchema, type CreateInvitationRequest } from '@time-tracker/shared';
import { useCreateInvitation } from '@/hooks/use-invitations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { getFieldStyle, RequiredMark } from '@/lib/form-styles';

type InviteMemberDialogProps = {
  organizationId: string;
  organizationName?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
};

export function InviteMemberDialog({
  organizationId,
  organizationName,
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
    formState: { errors, dirtyFields },
  } = useForm<CreateInvitationRequest>({
    resolver: zodResolver(organizationSchema.createInvitationRequest),
    defaultValues: {
      email: '',
    },
    mode: 'onTouched',
  });

  const isEmailValid = Boolean(dirtyFields.email && !errors.email);
  const hasEmailValue = Boolean(dirtyFields.email);

  async function onSubmit(data: CreateInvitationRequest) {
    setSuccessMessage(null);
    try {
      await sendInvite(data);
      setSuccessMessage(`Pozvánka byla úspěšně odeslána na ${data.email}.`);
      resetForm();
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      // API error je zachycen přes mutation hook
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
            <Button size="sm" className="gap-2">
              <UserPlus className="size-4" />
              <span>Pozvat člena</span>
            </Button>
          )
        }
      />

      <DialogContent className="max-w-md p-6">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <UserPlus className="text-primary size-5" />
            <span>Pozvat uživatele do skupiny</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {organizationName
              ? `Pozvánka pro nového člena do skupiny ${organizationName}.`
              : 'Zadejte e-mail uživatele, kterému chcete zaslat pozvánku.'}
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
            <DialogFooter>
              <DialogClose render={<Button className="w-full">Rozumím</Button>} />
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="invite-email" className="text-xs font-semibold">
                    E-mailová adresa <RequiredMark />
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      <Mail
                        aria-hidden="true"
                        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                      />
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="uzivatel@example.com"
                        className={`h-11 pl-10 text-sm ${getFieldStyle(isEmailValid, hasEmailValue)}`}
                        disabled={isPending}
                        {...register('email')}
                      />
                    </div>
                  </FieldContent>
                  <FieldError errors={[errors.email]} />
                </Field>
              </FieldGroup>
            </FieldSet>

            {apiError && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>
                  {apiError.message || 'Pozvánku se nepodařilo odeslat. Zkuste to prosím znovu.'}
                </span>
              </div>
            )}

            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <DialogClose
                render={
                  <Button type="button" variant="outline" disabled={isPending}>
                    Zrušit
                  </Button>
                }
              />
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Spinner className="size-4" />}
                <span>{isPending ? 'Odesílání…' : 'Odeslat pozvánku'}</span>
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

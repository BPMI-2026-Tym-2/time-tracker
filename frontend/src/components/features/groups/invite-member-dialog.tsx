'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, CheckCircle2, RotateCcw, UserPlus } from 'lucide-react';
import { organizationSchema, type CreateInvitationRequest } from '@time-tracker/shared';
import { useCreateInvitation } from '@/hooks/use-invitations';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';

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
      setSuccessMessage(`Pozvánka byla úspěšně odeslána na e-mail ${data.email}.`);
      resetForm();
      onSuccess?.(data.email);
    } catch {
      // Error handled via mutation state
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
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-[#13251B] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#1E3426] active:scale-95"
            >
              <UserPlus className="size-4" />
              <span>Pozvat člena</span>
            </button>
          )
        }
      />

      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[480px] rounded-3xl border border-[#DFD8CC] bg-white p-8 text-[#1C261F] shadow-2xl focus:outline-hidden"
      >
        <DialogClose
          render={
            <button
              type="button"
              className="absolute top-5 right-5 flex size-8 items-center justify-center rounded-full text-[#1C261F] transition-colors hover:bg-[#F3F4F6] active:scale-95"
              aria-label="Zavřít"
            >
              <X className="size-5" />
            </button>
          }
        />

        <h2 className="text-center text-2xl font-bold tracking-tight text-[#1C261F]">
          Pozvat člena
        </h2>

        <p className="mt-2 text-center text-sm text-[#4A4742]">
          Pozvěte nového člena do skupiny <strong>&quot;{organizationName}&quot;</strong>!
        </p>

        {successMessage ? (
          <div className="my-6 space-y-4">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center">
              <CheckCircle2 className="size-8 text-emerald-600" />
              <p className="text-base font-bold text-emerald-950">Pozvánka odeslána</p>
              <p className="text-xs text-emerald-800">{successMessage}</p>
            </div>

            <div className="flex justify-center">
              <DialogClose
                render={
                  <button
                    type="button"
                    className="rounded-xl bg-[#13251B] px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E3426]"
                  >
                    Rozumím
                  </button>
                }
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
            <div>
              <label
                htmlFor="invitation-email-input"
                className="block text-center text-sm font-medium text-[#1C261F]"
              >
                Vložte E-mail uživatele:
              </label>

              <div className="mt-2">
                <input
                  id="invitation-email-input"
                  type="email"
                  placeholder="daniel@seznam.cz"
                  disabled={isPending}
                  aria-invalid={Boolean(errors.email)}
                  className={`h-11 w-full rounded-xl border bg-[#F1F4F9] px-4 text-center text-sm font-normal text-[#1C261F] outline-hidden transition-all placeholder:text-[#94A3B8] focus:border-[#1E3426] focus:bg-white focus:ring-2 focus:ring-[#1E3426]/20 disabled:opacity-50 ${
                    errors.email ? 'border-rose-500 ring-2 ring-rose-200' : 'border-[#E2E8F0]'
                  }`}
                  {...register('email')}
                />
              </div>

              {errors.email && (
                <p className="mt-2 text-center text-xs font-semibold text-rose-600" role="alert">
                  {errors.email.message || 'Zadejte platnou e-mailovou adresu.'}
                </p>
              )}
            </div>

            {apiError && (
              <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-center">
                <p className="text-xs font-bold text-rose-700">Pozvánku se nepodařilo odeslat</p>
                <p className="text-[11px] text-rose-600">
                  Při odesílání došlo k chybě. Zkontrolujte spojení a zkuste to prosím znovu.
                </p>
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 underline hover:no-underline"
                >
                  <RotateCcw className="size-3" />
                  <span>Zkusit znovu</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 pt-2">
              <DialogClose
                render={
                  <button
                    type="button"
                    disabled={isPending}
                    className="min-w-[110px] rounded-xl border border-[#DFD8CC] bg-[#F5F2EB] px-6 py-2.5 text-center text-sm font-semibold text-[#1C261F] transition-colors hover:bg-[#EBE5DA] active:scale-95 disabled:opacity-50"
                  >
                    Zavřít
                  </button>
                }
              />

              <button
                type="submit"
                disabled={isPending}
                className="min-w-[120px] rounded-xl bg-[#13251B] px-8 py-2.5 text-center text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#1E3426] active:scale-95 disabled:opacity-50"
              >
                {isPending ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Spinner className="size-3.5 text-white" />
                    <span>Odesílám...</span>
                  </span>
                ) : (
                  'Pozvat'
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

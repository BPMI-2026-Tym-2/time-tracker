'use client';

import { useId, useState, type FormEvent } from 'react';
import { addHours, format } from 'date-fns';
import { activitySchema, type ActivityResponse } from '@time-tracker/shared';
import { useCreateActivity } from '@/hooks/use-activities';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const dateTimeFormat = "yyyy-MM-dd'T'HH:mm";

function localDateToIso(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null;

  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || format(date, dateTimeFormat) !== value) return null;
  return date.toISOString();
}

type AddActivityDialogProps = {
  startedAt: Date;
  userId: string;
  organizationId?: string;
  onClose: () => void;
  onSaved: (activity: ActivityResponse) => void;
};

export function AddActivityDialog({
  startedAt,
  userId,
  organizationId,
  onClose,
  onSaved,
}: AddActivityDialogProps) {
  const id = useId();
  const [error, setError] = useState<string>();
  const { mutateAsync, isPending } = useCreateActivity(userId, organizationId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const fields = new FormData(event.currentTarget);
    const start = localDateToIso(fields.get('startedAt'));
    const end = localDateToIso(fields.get('endedAt'));

    if (!start || !end) {
      setError('Zadejte platný začátek a konec aktivity.');
      return;
    }

    const input = { name: String(fields.get('name') ?? ''), startedAt: start, endedAt: end };
    const validation = activitySchema.createRequest.safeParse(input);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Zkontrolujte údaje aktivity.');
      return;
    }

    setError(undefined);
    try {
      const activity = await mutateAsync(input);
      onSaved(activity);
    } catch {
      setError('Aktivitu se nepodařilo uložit. Zkuste to znovu.');
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Přidat aktivitu</DialogTitle>
          <DialogDescription>
            {organizationId ? 'Záznamník skupiny' : 'Vlastní záznamník'}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Název aktivity</Label>
            <Input id={`${id}-name`} name="name" required maxLength={200} disabled={isPending} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label htmlFor={`${id}-start`}>Začátek</Label>
              <Input
                id={`${id}-start`}
                name="startedAt"
                type="datetime-local"
                defaultValue={format(startedAt, dateTimeFormat)}
                required
                disabled={isPending}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label htmlFor={`${id}-end`}>Konec</Label>
              <Input
                id={`${id}-end`}
                name="endedAt"
                type="datetime-local"
                defaultValue={format(addHours(startedAt, 1), dateTimeFormat)}
                required
                disabled={isPending}
              />
            </div>
          </div>
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Zrušit
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Ukládám…' : 'Uložit aktivitu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

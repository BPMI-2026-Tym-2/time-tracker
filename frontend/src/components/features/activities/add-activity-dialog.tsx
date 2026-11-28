'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { addDays, format } from 'date-fns';
import { X } from 'lucide-react';
import {
  activityCalendarDate,
  activitySchema,
  pastActivityDateMessage,
  type ActivityResponse,
  type CreateActivityRequest,
} from '@time-tracker/shared';
import { useCreateActivity } from '@/hooks/use-activities';
import { listActivities } from '@/lib/api/activities';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';

const dateTimeFormat = "yyyy-MM-dd'T'HH:mm";

function localDateToIso(value: string): string | null {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || format(date, dateTimeFormat) !== value) return null;
  return date.toISOString();
}

type AddActivityDialogProps = {
  startedAt: Date;
  endedAt?: Date;
  userId: string;
  organizationId?: string;
  onClose: () => void;
  onSaved: (activity: ActivityResponse) => void;
};

export function AddActivityDialog({
  startedAt,
  endedAt,
  userId,
  organizationId,
  onClose,
  onSaved,
}: AddActivityDialogProps) {
  const id = useId();
  const nameInput = useRef<HTMLInputElement>(null);
  const startInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [dateError, setDateError] = useState(false);
  const [checkingOverlap, setCheckingOverlap] = useState(false);
  const [overlappingActivity, setOverlappingActivity] = useState<CreateActivityRequest>();
  const { mutateAsync, isPending } = useCreateActivity(userId, organizationId);

  const today = activityCalendarDate();
  const initialDate = format(startedAt, 'yyyy-MM-dd');
  const busy = checkingOverlap || isPending;
  const fieldsDisabled = busy || Boolean(overlappingActivity);

  async function saveActivity(input: CreateActivityRequest) {
    try {
      const activity = await mutateAsync(input);
      onSaved(activity);
    } catch {
      setError('Aktivitu se nepodařilo uložit. Zkuste to znovu.');
    }
  }

  function editTime() {
    setOverlappingActivity(undefined);
    requestAnimationFrame(() => startInput.current?.focus());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fieldsDisabled) return;

    const fields = new FormData(event.currentTarget);
    const date = String(fields.get('date') ?? '');
    if (date && date < activityCalendarDate()) {
      setDateError(true);
      return;
    }
    setDateError(false);
    const startTime = String(fields.get('startedAt') ?? '');
    const endTime = String(fields.get('endedAt') ?? '');
    const initialStart = format(startedAt, dateTimeFormat);
    const startValue = `${date}T${startTime}`;
    const start =
      endedAt && startValue === initialStart ? startedAt.toISOString() : localDateToIso(startValue);
    // An earlier end time belongs to the following calendar day.
    const endDate =
      start && endTime < startTime ? format(addDays(new Date(start), 1), 'yyyy-MM-dd') : date;
    const end =
      endedAt && startValue === initialStart && endTime === format(endedAt, 'HH:mm')
        ? endedAt.toISOString()
        : localDateToIso(`${endDate}T${endTime}`);

    if (!start || !end) {
      setError('Zadejte platný začátek a konec aktivity.');
      return;
    }

    const input = {
      name: String(fields.get('name') ?? ''),
      description: String(fields.get('description') ?? '').trim() || undefined,
      recurrence: fields.get('recurrence'),
      startedAt: start,
      endedAt: end,
    };
    const validation = activitySchema.createRequest.safeParse(input);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? 'Zkontrolujte údaje aktivity.');
      return;
    }

    const request = { ...input, recurrence: validation.data.recurrence };
    setError(undefined);
    setCheckingOverlap(true);
    try {
      const { items } = await listActivities(start, end, undefined, organizationId);
      if (items.length > 0) {
        setOverlappingActivity(request);
      } else {
        await saveActivity(request);
      }
    } catch {
      setError('Překrývání aktivit se nepodařilo ověřit. Zkuste to znovu.');
    } finally {
      setCheckingOverlap(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        initialFocus={nameInput}
        className="max-h-[calc(100dvh-2rem)] gap-6 overflow-y-auto rounded-[20px] p-6 sm:max-w-[480px]"
      >
        <DialogHeader className="gap-1 pr-10">
          <DialogTitle className="text-lg leading-tight">Přidat aktivitu</DialogTitle>
          <DialogDescription>Vyplňte informace o nové aktivitě.</DialogDescription>
        </DialogHeader>
        <DialogClose
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-4 bg-[#a98b52] text-[#21190e] hover:bg-[#ba9c64] hover:text-[#21190e]"
              aria-label="Zavřít"
              disabled={busy}
            />
          }
        >
          <X aria-hidden="true" />
        </DialogClose>
        <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <Label htmlFor={`${id}-name`}>Název aktivity</Label>
            <Input
              ref={nameInput}
              id={`${id}-name`}
              name="name"
              className="h-11"
              required
              maxLength={200}
              disabled={fieldsDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-description`}>Popis aktivity</Label>
            <Textarea
              id={`${id}-description`}
              name="description"
              className="min-h-24"
              placeholder="Např. trénink v bazénu, sraz u haly…"
              maxLength={2000}
              disabled={fieldsDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-date`}>Datum</Label>
            <Input
              id={`${id}-date`}
              name="date"
              type="date"
              className="h-11"
              min={today}
              defaultValue={initialDate < today ? today : initialDate}
              required
              disabled={fieldsDisabled}
              aria-invalid={dateError}
              aria-describedby={dateError ? `${id}-date-error` : undefined}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setDateError(Boolean(value && value < activityCalendarDate()));
              }}
              onInvalid={(event) => {
                if (event.currentTarget.validity.rangeUnderflow) setDateError(true);
              }}
            />
            {dateError && (
              <p id={`${id}-date-error`} role="alert" className="text-destructive text-sm">
                {pastActivityDateMessage}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-start`}>Začátek</Label>
            <Input
              ref={startInput}
              id={`${id}-start`}
              name="startedAt"
              type="time"
              className="h-11"
              defaultValue={endedAt ? format(startedAt, 'HH:mm') : ''}
              required
              disabled={fieldsDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-end`}>Konec</Label>
            <Input
              id={`${id}-end`}
              name="endedAt"
              type="time"
              className="h-11"
              defaultValue={endedAt ? format(endedAt, 'HH:mm') : ''}
              required
              disabled={fieldsDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-recurrence`}>Opakování</Label>
            <NativeSelect
              id={`${id}-recurrence`}
              name="recurrence"
              className="w-full"
              defaultValue="none"
              disabled={fieldsDisabled}
            >
              <NativeSelectOption value="none">Neopakovat</NativeSelectOption>
              <NativeSelectOption value="daily">Denně</NativeSelectOption>
              <NativeSelectOption value="weekly">Týdně</NativeSelectOption>
              <NativeSelectOption value="monthly">Měsíčně</NativeSelectOption>
              <NativeSelectOption value="yearly">Ročně</NativeSelectOption>
            </NativeSelect>
          </div>
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          {overlappingActivity ? (
            <div className="space-y-3">
              <p
                role="status"
                className="rounded-xl bg-sky-50 p-3 text-sm text-sky-900 dark:bg-sky-950 dark:text-sky-100"
              >
                Zadaný čas se překrývá s existující aktivitou.
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={editTime} disabled={busy}>
                  Upravit čas
                </Button>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setOverlappingActivity(undefined);
                    void saveActivity(overlappingActivity);
                  }}
                >
                  Vytvořit i přesto
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
              <DialogClose render={<Button type="button" variant="outline" disabled={busy} />}>
                Zavřít
              </DialogClose>
              <Button type="submit" disabled={busy}>
                {checkingOverlap ? 'Kontroluji čas…' : isPending ? 'Vytvářím…' : 'Vytvořit'}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

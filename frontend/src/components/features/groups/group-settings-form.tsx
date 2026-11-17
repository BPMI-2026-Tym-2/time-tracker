'use client';

import { useState } from 'react';
import { useFormState, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import type {
  OrganizationSettingsResponse,
  UpdateOrganizationSettingsRequest,
} from '@time-tracker/shared';
import {
  Pencil,
  Users,
  Link as LinkIcon,
  Copy,
  Check,
  Trash2,
  LoaderCircle,
  UserPlus,
} from 'lucide-react';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InviteMemberDialog } from './invite-member-dialog';
import { getFieldStyle, RequiredMark } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

type GroupSettingsFormProps = {
  form: UseFormReturn<UpdateOrganizationSettingsRequest>;
  settings: OrganizationSettingsResponse;
  onSubmit: SubmitHandler<UpdateOrganizationSettingsRequest>;
  isPending: boolean;
  errorMessage?: string;
  onDeleteClick: () => void;
};

export function GroupSettingsForm({
  form,
  settings,
  onSubmit,
  isPending,
  errorMessage,
  onDeleteClick,
}: GroupSettingsFormProps) {
  const { control, register, handleSubmit, reset } = form;
  const { errors, dirtyFields, isDirty } = useFormState({ control });
  const [copiedCode, setCopiedCode] = useState(false);

  const nameFieldStyle = getFieldStyle(!errors.name, Boolean(dirtyFields.name));

  async function handleCopyCode() {
    await navigator.clipboard.writeText(settings.invitationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  const ownerName = settings.owner
    ? `${settings.owner.name} ${settings.owner.surname}`.trim()
    : 'Neznámý vlastník';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldSet className="space-y-6">
        <FieldGroup className="border-border bg-card space-y-5 rounded-2xl border p-6">
          <Field
            className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[160px_1fr]"
            data-invalid={Boolean(errors.name)}
          >
            <FieldLabel
              htmlFor="group-name"
              className={cn('flex items-center gap-2 text-sm font-semibold', nameFieldStyle)}
            >
              <Pencil className="size-4" />
              <span>Název skupiny</span>
              <RequiredMark />
            </FieldLabel>
            <div className="w-full">
              <Input
                id="group-name"
                type="text"
                maxLength={100}
                placeholder="Skupina 1"
                aria-invalid={Boolean(errors.name)}
                className={nameFieldStyle}
                {...register('name')}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </div>
          </Field>

          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[160px_1fr]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users className="size-4" />
              <span>Vlastník skupiny</span>
            </div>
            <div>
              <span className="bg-muted text-foreground inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium">
                {ownerName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[160px_1fr]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <LinkIcon className="size-4" />
              <span>Pozvánkový kód</span>
            </div>
            <div className="border-border bg-muted/50 flex w-full items-center justify-between rounded-xl border px-4 py-2 text-sm">
              <span className="font-mono tracking-wider">{settings.invitationCode}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => void handleCopyCode()}
                aria-label="Zkopírovat pozvánkový kód"
              >
                {copiedCode ? (
                  <Check className="size-3.5 text-green-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[160px_1fr]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <UserPlus className="size-4" />
              <span>Pozvat nového člena</span>
            </div>
            <div>
              <InviteMemberDialog organizationId={settings.id} organizationName={settings.name} />
            </div>
          </div>
        </FieldGroup>

        {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}

        <div className="flex flex-col items-stretch justify-between gap-4 pt-2 sm:flex-row sm:items-center">
          <div>
            {settings.permissions.canDelete && (
              <Button type="button" variant="destructive" onClick={onDeleteClick}>
                <Trash2 className="size-4" />
                <span>Odstranit skupinu</span>
              </Button>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={!isDirty || isPending}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={!isDirty || isPending}>
              {isPending ? <LoaderCircle className="size-4 animate-spin" /> : 'Uložit'}
            </Button>
          </div>
        </div>
      </FieldSet>
    </form>
  );
}

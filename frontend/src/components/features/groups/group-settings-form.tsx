'use client';

import { useFormState, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import type {
  OrganizationSettingsResponse,
  UpdateOrganizationSettingsRequest,
} from '@time-tracker/shared';
import { Pencil, Users, LoaderCircle, AlignLeft } from 'lucide-react';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getFieldStyle, RequiredMark } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

type GroupSettingsFormProps = {
  form: UseFormReturn<UpdateOrganizationSettingsRequest>;
  settings: OrganizationSettingsResponse;
  onSubmit: SubmitHandler<UpdateOrganizationSettingsRequest>;
  isPending: boolean;
  errorMessage?: string;
};

export function GroupSettingsForm({
  form,
  settings,
  onSubmit,
  isPending,
  errorMessage,
}: GroupSettingsFormProps) {
  const { control, register, handleSubmit, reset } = form;
  const { canEdit } = settings.permissions;
  const { errors, dirtyFields, isDirty } = useFormState({ control });

  const nameFieldStyle = getFieldStyle(!errors.name, Boolean(dirtyFields.name));
  const descFieldStyle = getFieldStyle(!errors.description, Boolean(dirtyFields.description));
  const ownerFullName = `${settings.owner.name} ${settings.owner.surname}`.trim();

  if (!canEdit) {
    return (
      <dl className="border-border bg-card space-y-5 rounded-2xl border p-6 text-sm">
        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
          <dt className="font-semibold">Název skupiny</dt>
          <dd className="wrap-break-word">{settings.name}</dd>
        </div>
        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
          <dt className="font-semibold">Popis skupiny</dt>
          <dd className="wrap-break-word whitespace-pre-wrap">
            {settings.description || 'Bez popisu'}
          </dd>
        </div>
        <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
          <dt className="font-semibold">Vlastník skupiny</dt>
          <dd className="wrap-break-word">{ownerFullName}</dd>
        </div>
      </dl>
    );
  }

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

          <Field
            className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[160px_1fr]"
            data-invalid={Boolean(errors.description)}
          >
            <FieldLabel
              htmlFor="group-description"
              className={cn('flex items-center gap-2 pt-2 text-sm font-semibold', descFieldStyle)}
            >
              <AlignLeft className="size-4" />
              <span>Popis skupiny</span>
            </FieldLabel>
            <div className="w-full">
              <Textarea
                id="group-description"
                rows={3}
                maxLength={1000}
                placeholder="Sdílený prostor pro plánování aktivit, záznamy a spolupráci členů skupiny."
                aria-invalid={Boolean(errors.description)}
                className={cn('resize-y', descFieldStyle)}
                {...register('description')}
              />
              {errors.description && <FieldError>{errors.description.message}</FieldError>}
            </div>
          </Field>

          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[160px_1fr]">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users className="size-4" />
              <span>Vlastník skupiny</span>
            </div>
            <div>
              <span className="bg-muted text-foreground inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium">
                {ownerFullName}
              </span>
            </div>
          </div>
        </FieldGroup>

        {errorMessage && <FieldError>{errorMessage}</FieldError>}

        <div className="flex items-center justify-end gap-3 pt-2">
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
      </FieldSet>
    </form>
  );
}

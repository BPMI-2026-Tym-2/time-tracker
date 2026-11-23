'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFormState, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Plus } from 'lucide-react';
import {
  organizationSchema,
  type CreateOrganizationRequest,
  type CreateOrganizationResponse,
} from '@time-tracker/shared';
import { useCreateOrganization } from '@/hooks/use-create-organization';
import { getFieldStyle, RequiredMark } from '@/lib/form-styles';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { toast } from '@/components/ui/toast';

export const DEFAULT_GROUP_CATEGORIES = [
  'Práce',
  'Studium',
  'Osobní',
  'Sport',
  'Domácnost',
  'Cestování',
  'Finance',
  'Zábava',
] as const;

export const DEFAULT_GROUP_TAGS = [
  'Důležité',
  'Pravidelné',
  'Projekt',
  'Schůzka',
  'Nákup',
  'Plánování',
  'Tým',
  'Ostatní',
] as const;

type MultiSelectChipsFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  defaultOptions: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  errorMessage?: string;
  disabled?: boolean;
};

function MultiSelectChipsField({
  id,
  label,
  placeholder,
  defaultOptions,
  value,
  onChange,
  errorMessage,
  disabled,
}: MultiSelectChipsFieldProps) {
  const anchorRef = useComboboxAnchor();
  const [inputValue, setInputValue] = useState('');

  const availableOptions = useMemo(() => {
    const merged = new Set<string>([...defaultOptions, ...value]);
    const trimmed = inputValue.trim();
    if (trimmed.length > 0) {
      merged.add(trimmed);
    }
    return Array.from(merged);
  }, [defaultOptions, value, inputValue]);

  const filteredOptions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) return availableOptions;
    return availableOptions.filter((option) => option.toLowerCase().includes(query));
  }, [availableOptions, inputValue]);

  function handleAddCustomValue(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue('');
  }

  return (
    <Field className="gap-1" data-invalid={Boolean(errorMessage)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Combobox
        multiple
        value={value}
        onValueChange={(nextValue) => {
          onChange(nextValue as string[]);
          setInputValue('');
        }}
        inputValue={inputValue}
        onInputValueChange={(nextInput) => setInputValue(nextInput)}
        disabled={disabled}
      >
        <ComboboxChips
          ref={anchorRef}
          className="relative pr-8"
          aria-invalid={Boolean(errorMessage)}
        >
          {value.map((item) => (
            <ComboboxChip key={item}>{item}</ComboboxChip>
          ))}
          <ComboboxChipsInput
            id={id}
            placeholder={value.length === 0 ? placeholder : ''}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && inputValue.trim().length > 0) {
                event.preventDefault();
                handleAddCustomValue(inputValue);
              }
            }}
          />
          <ComboboxTrigger
            className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer"
            aria-label={`Rozbalit ${label.toLowerCase()}`}
          />
        </ComboboxChips>

        <ComboboxContent anchor={anchorRef}>
          <ComboboxList>
            {filteredOptions.map((item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            ))}
          </ComboboxList>
          <ComboboxEmpty>Žádné položky</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
      {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
    </Field>
  );
}

type CreateGroupDialogProps = {
  trigger?: React.ReactElement;
  onCreated?: (organization: CreateOrganizationResponse) => void;
};

export function CreateGroupDialog({ trigger, onCreated }: CreateGroupDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    mutateAsync: submitCreateOrganization,
    isPending,
    error: apiError,
    reset: resetMutation,
  } = useCreateOrganization();

  const isBusy = isPending || isRedirecting;

  const form = useForm<CreateOrganizationRequest>({
    resolver: zodResolver(organizationSchema.createOrganizationRequest),
    defaultValues: {
      name: '',
      description: '',
      categories: [],
      tags: [],
    },
    mode: 'onChange',
  });

  const { errors, dirtyFields, isDirty } = useFormState({ control: form.control });
  const categories = useWatch({ control: form.control, name: 'categories' }) ?? [];
  const tags = useWatch({ control: form.control, name: 'tags' }) ?? [];

  const hasUnsavedChanges = isDirty || categories.length > 0 || tags.length > 0;

  const nameFieldStyle = getFieldStyle(!errors.name, Boolean(dirtyFields.name));
  const descriptionFieldStyle = getFieldStyle(
    !errors.description,
    Boolean(dirtyFields.description),
  );

  const categoriesErrorMessage =
    errors.categories?.message ??
    (Array.isArray(errors.categories)
      ? errors.categories.find((item) => item?.message)?.message
      : undefined);

  const tagsErrorMessage =
    errors.tags?.message ??
    (Array.isArray(errors.tags) ? errors.tags.find((item) => item?.message)?.message : undefined);

  function closeAndResetDialog() {
    setIsCancelConfirmOpen(false);
    setIsOpen(false);
    form.reset({
      name: '',
      description: '',
      categories: [],
      tags: [],
    });
    resetMutation();
  }

  function handleRequestClose() {
    if (isBusy) return;
    if (hasUnsavedChanges) {
      setIsCancelConfirmOpen(true);
    } else {
      closeAndResetDialog();
    }
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setIsOpen(true);
      return;
    }
    handleRequestClose();
  }

  async function onSubmit(data: CreateOrganizationRequest) {
    try {
      const created = await submitCreateOrganization(data);
      setIsRedirecting(true);
      toast.add({
        type: 'success',
        title: 'Skupina byla úspěšně vytvořena',
      });
      closeAndResetDialog();
      onCreated?.(created);
      router.push(`/groups/${created.id}`);
    } catch {
      // Chyba API je zobrazena přes stav mutace (apiError)
    }
  }

  return (
    <>
      {isRedirecting && (
        <div
          className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs"
          role="status"
          aria-live="polite"
        >
          <Spinner />
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger
          render={
            trigger ?? (
              <Button type="button" className="gap-2 text-white">
                <Plus className="size-4" />
                <span>Vytvořit novou skupinu</span>
              </Button>
            )
          }
        />

        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Vytvoření nové skupiny
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FieldSet>
              <FieldGroup>
                <Field className="gap-1" data-invalid={Boolean(errors.name)}>
                  <FieldLabel htmlFor="group-name" className={nameFieldStyle}>
                    Název <RequiredMark />
                  </FieldLabel>
                  <Input
                    id="group-name"
                    required
                    placeholder="Zadejte název nové skupiny"
                    className={nameFieldStyle}
                    aria-invalid={Boolean(errors.name)}
                    disabled={isPending}
                    {...form.register('name')}
                  />
                  {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </Field>

                <Field className="gap-1" data-invalid={Boolean(errors.description)}>
                  <FieldLabel htmlFor="group-description" className={descriptionFieldStyle}>
                    Popis <RequiredMark />
                  </FieldLabel>
                  <Input
                    id="group-description"
                    required
                    placeholder="Zadejte popis skupiny"
                    className={descriptionFieldStyle}
                    aria-invalid={Boolean(errors.description)}
                    disabled={isPending}
                    {...form.register('description')}
                  />
                  {errors.description && <FieldError>{errors.description.message}</FieldError>}
                </Field>

                <MultiSelectChipsField
                  id="group-categories"
                  label="Kategorie"
                  placeholder="Vyberte nebo zadejte kategorii a stiskněte Enter"
                  defaultOptions={DEFAULT_GROUP_CATEGORIES}
                  value={categories}
                  onChange={(next) =>
                    form.setValue('categories', next, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  errorMessage={categoriesErrorMessage}
                  disabled={isPending}
                />

                <MultiSelectChipsField
                  id="group-tags"
                  label="Tagy"
                  placeholder="Vyberte nebo zadejte tag a stiskněte Enter"
                  defaultOptions={DEFAULT_GROUP_TAGS}
                  value={tags}
                  onChange={(next) =>
                    form.setValue('tags', next, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  errorMessage={tagsErrorMessage}
                  disabled={isPending}
                />
              </FieldGroup>

              {apiError ? <FieldError>{apiError.message}</FieldError> : null}

              <DialogFooter className="mt-2 flex-row justify-between gap-3 sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-28"
                  onClick={handleRequestClose}
                  disabled={isBusy}
                >
                  Zrušit
                </Button>

                <Button type="submit" className="min-w-36 gap-2" disabled={isBusy}>
                  {isBusy ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      <span>Vytvářím...</span>
                    </>
                  ) : (
                    'Vytvořit skupinu'
                  )}
                </Button>
              </DialogFooter>
            </FieldSet>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Zrušit vytváření skupiny?</AlertDialogTitle>
            <AlertDialogDescription>
              Vytvořené změny budou ztraceny. Opravdu chcete pokračovat?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsCancelConfirmOpen(false)}>
              Zpět
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={closeAndResetDialog}>
              Potvrdit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

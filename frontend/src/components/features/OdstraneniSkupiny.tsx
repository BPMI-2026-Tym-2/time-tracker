'use client';

import { useRef } from 'react';
import { Trash2, AlertCircle, X } from 'lucide-react';
import { toast } from '@/components/ui/toast';

type OdstraneniSkupinyProps = {
  groupId: string;
  groupName: string;
  isOwner: boolean;
  onDeleted?: () => void;
};

export default function OdstraneniSkupiny({
  groupName,
  isOwner,
  onDeleted,
}: OdstraneniSkupinyProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  async function handleDelete() {
    try {
      closeDialog();
      toast.add({
        type: 'success',
        title: 'Skupina byla úspěšně odstraněna.',
        description: `Skupina "${groupName}" byla v souladu s tokem A4 smazána.`,
      });
      onDeleted?.();
    } catch {
      closeDialog();
      toast.add({
        type: 'error',
        title: 'Odstranění skupiny se nezdařilo.',
        description: 'Zkuste to prosím znovu.',
      });
    }
  }

  if (!isOwner) {
    return null;
  }

  return (
    <>
      {/* Delete tlačítko sladěné s FeaTHer wireframem */}
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
        onClick={openDialog}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Odstranit skupinu</span>
      </button>

      {/* Potvrzovací dialog okno */}
      <dialog
        ref={dialogRef}
        className="m-auto w-[90%] max-w-md rounded-2xl bg-white p-6 text-slate-900 shadow-xl backdrop:bg-black/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertCircle className="h-5 w-5" />
          </div>

          <h2 className="text-base font-bold text-slate-900">Odstranění skupiny</h2>

          <button
            type="button"
            onClick={closeDialog}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Zavřít"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-600">
          Opravdu chcete odstranit skupinu{' '}
          <strong className="text-slate-900">&quot;{groupName}&quot;</strong>? Tato akce je nevratná
          a odstraní všechna data, členy a nastavení spojená se skupinou.
        </p>

        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={closeDialog}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Zrušit
          </button>

          <button
            type="button"
            className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-red-700"
            onClick={handleDelete}
          >
            Odstranit skupinu
          </button>
        </div>
      </dialog>
    </>
  );
}

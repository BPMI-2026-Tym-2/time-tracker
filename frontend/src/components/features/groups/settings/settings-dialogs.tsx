'use client';

import { AlertCircle, Trash2, UserPlus, Check, Copy } from 'lucide-react';
import type { GroupMemberResponse } from '@time-tracker/shared';
import { Button } from '@/components/ui/button';

type SettingsDialogsProps = {
  groupName?: string;
  showDeleteGroup?: boolean;
  onCancelDeleteGroup?: () => void;
  onConfirmDeleteGroup?: () => void;
  memberToDelete: GroupMemberResponse | null;
  onCancelDeleteMember: () => void;
  onConfirmDeleteMember: (member: GroupMemberResponse) => void;
  isInviteOpen: boolean;
  onCloseInvite: () => void;
  invitationCode: string;
  copiedCode: boolean;
  onCopyCode: () => void;
};

export function SettingsDialogs({
  groupName,
  showDeleteGroup,
  onCancelDeleteGroup,
  onConfirmDeleteGroup,
  memberToDelete,
  onCancelDeleteMember,
  onConfirmDeleteMember,
  isInviteOpen,
  onCloseInvite,
  invitationCode,
  copiedCode,
  onCopyCode,
}: SettingsDialogsProps) {
  return (
    <>
      {/* Dialog A4: Odstranění skupiny */}
      {showDeleteGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-base font-bold text-slate-900">Odstranění skupiny</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              Opravdu chcete odstranit skupinu{' '}
              <strong className="text-slate-900">{groupName}</strong>? Tato akce je nevratná a
              odstraní všechna data, členy a nastavení spojená se skupinou.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onCancelDeleteGroup}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={onConfirmDeleteGroup}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
              >
                Odstranit skupinu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog A3: Odstranění člena skupiny */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 text-red-600">
              <Trash2 className="h-5 w-5" />
              <h3 className="text-base font-bold text-slate-900">Odstranění člena</h3>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Opravdu chcete odebrat člena{' '}
              <strong className="text-slate-900">
                {memberToDelete.name} {memberToDelete.surname}
              </strong>{' '}
              ze skupiny? Uživatel ztratí přístup k aktivitám a obsahu skupiny.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onCancelDeleteMember}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={() => onConfirmDeleteMember(memberToDelete)}
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
              >
                Odstranit člena
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Pozvat člena do skupiny */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 text-blue-600">
              <UserPlus className="h-5 w-5" />
              <h3 className="text-base font-bold text-slate-900">Pozvat člena do skupiny</h3>
            </div>
            <p className="mt-2.5 text-xs text-slate-600">
              Sdílejte níže uvedený unikátní pozvánkový kód s novým členem. Pomocí tohoto kódu se
              může připojit ke skupině.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={invitationCode}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center font-mono text-sm font-bold tracking-widest text-slate-900"
              />
              <Button
                type="button"
                onClick={onCopyCode}
                className="shrink-0 bg-blue-600 text-white hover:bg-blue-700"
              >
                {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedCode ? 'Zkopírováno' : 'Kopírovat kód'}</span>
              </Button>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={onCloseInvite}
                className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { useNotifications, useRespondInvitation } from '@/hooks/use-invitations';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import type { InvitationErrorCode } from '@/lib/api/invitations';

interface NotificationInboxProps {
  /**
   * Volitelná simulace chybových stavů pro otestování alternativních toků BUC (A3, A4, A5)
   */
  simulatedScenario?: InvitationErrorCode;
  onAcceptSuccess?: (organizationName?: string) => void;
  onRejectSuccess?: (organizationName?: string) => void;
  /**
   * Režim pouze popup - nezpracovává skutečné připojení do skupiny na backendu
   */
  onlyPopup?: boolean;
}

export function NotificationInbox({
  simulatedScenario,
  onAcceptSuccess,
  onRejectSuccess,
  onlyPopup = true,
}: NotificationInboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, count, isLoading, refetch } = useNotifications();
  const { acceptInvitation, isAccepting, rejectInvitation, isRejecting, feedback, clearFeedback } =
    useRespondInvitation();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Krok 2 & Krok 5: Přijetí pozvánky (Happy Day)
  async function handleAccept(id: string, organizationName?: string) {
    if (onlyPopup) {
      setIsOpen(false);
      onAcceptSuccess?.(organizationName);
      return;
    }
    setProcessingId(id);
    try {
      await acceptInvitation({
        invitationId: id,
        organizationName,
        simulatedScenario,
      });
      void refetch();
      onAcceptSuccess?.(organizationName);
    } catch {
      // Chyba je zpracována a uložena do feedback stavu v hooku
    } finally {
      setProcessingId(null);
    }
  }

  // A1: Odmítnutí pozvánky
  async function handleReject(id: string, organizationName?: string) {
    if (onlyPopup) {
      setIsOpen(false);
      onRejectSuccess?.(organizationName);
      return;
    }
    setProcessingId(id);
    try {
      await rejectInvitation({
        invitationId: id,
        organizationName,
      });
      void refetch();
      onRejectSuccess?.(organizationName);
    } catch {
      // Chyba je zpracována a uložena do feedback stavu v hooku
    } finally {
      setProcessingId(null);
    }
  }

  // A2: Uživatel uzavře panel oznámení pomocí ikony "✕"
  function handleClosePanel() {
    setIsOpen(false);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="relative flex size-10 items-center justify-center rounded-full transition-transform hover:scale-105 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1E3426] active:scale-95"
            aria-label={`Oznámení: ${count} nových pozvánek`}
          >
            {/* Zvonek ve stylu mockupu - tmavě zelená/olivová barva */}
            <Bell className="size-6 text-[#243327]" />

            {/* Červené kolečko s počtem nových oznámení */}
            {count > 0 && (
              <span
                className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D13438] px-1 text-[10px] font-bold text-white shadow-xs"
                data-testid="notifications-badge"
              >
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        }
      />

      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-[360px] overflow-hidden rounded-3xl border border-[#DFD8CC] bg-[#FAF7F2] p-0 text-[#1C261F] shadow-2xl focus:outline-hidden sm:w-[400px]"
      >
        {/* Šipka bubliny směřující nahoru ke zvonku jako v mockupu */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-2 right-6 size-4 rotate-45 border-t border-l border-[#DFD8CC] bg-[#FAF7F2]"
        />

        {/* Hlavička panelu Oznámení */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-xl font-bold tracking-tight text-[#1C261F]">Oznámení</h2>
          {/* A2: Tlačítko Zavřít (x) */}
          <button
            type="button"
            onClick={handleClosePanel}
            className="flex size-8 items-center justify-center rounded-full text-[#1C261F] transition-colors hover:bg-[#EAE2D5] active:scale-95"
            aria-label="Zavřít"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Dělící linka */}
        <div className="mx-6 border-b border-[#E7E0D3]" />

        {/* Zpětná vazba pro uživatele (Happy day, A1, A3, A4, A5) */}
        {feedback && (
          <div className="px-6 pt-4">
            <div
              className={`relative rounded-2xl border p-4 text-xs ${
                feedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50/90 text-emerald-950'
                  : feedback.type === 'info'
                    ? 'border-amber-200 bg-amber-50/90 text-amber-950'
                    : 'border-rose-200 bg-rose-50/90 text-rose-950'
              }`}
            >
              <button
                type="button"
                onClick={clearFeedback}
                className="absolute top-2.5 right-2.5 text-current opacity-60 hover:opacity-100"
                aria-label="Zavřít upozornění"
              >
                <X className="size-3.5" />
              </button>

              <div className="flex items-start gap-2.5">
                {feedback.type === 'success' && (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                )}
                {feedback.type === 'info' && (
                  <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
                )}
                {feedback.type === 'error' && (
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                )}
                <div className="space-y-1 pr-4">
                  <p className="text-sm leading-tight font-bold">{feedback.title}</p>
                  <p className="leading-relaxed opacity-90">{feedback.message}</p>

                  {/* A5: Umožnit uživateli akci znovu opakovat */}
                  {feedback.code === 'CONNECTION_FAILED' && feedback.invitationId && (
                    <button
                      type="button"
                      onClick={() =>
                        handleAccept(feedback.invitationId!, feedback.organizationName)
                      }
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-rose-800"
                    >
                      <RefreshCw className="size-3" />
                      <span>Zkusit znovu</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tělo panelu / Seznam pozvánek */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="size-6 text-[#1E3426]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#DFD8CC] bg-white/40 p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#EAE2D5] text-[#243327]">
                <Bell className="size-6 opacity-70" />
              </div>
              <p className="mt-3 text-base font-semibold text-[#1C261F]">Žádná nová oznámení</p>
              <p className="mt-1 text-xs text-[#5E5A54]">
                Nemáte žádné nevyřízené pozvánky do skupin.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const isItemProcessing = processingId === notification.id;
                const isButtonsDisabled = isItemProcessing || isAccepting || isRejecting;

                return (
                  <div
                    key={notification.id}
                    className="rounded-2xl border border-[#E3DDD1] bg-white/80 p-5 shadow-xs transition-shadow hover:shadow-sm"
                  >
                    {/* Nadpis pozvánky */}
                    <h3 className="text-base font-bold text-[#1C261F]">Pozvánka do skupiny</h3>

                    {/* Text pozvánky dle mockupu: Byli jste pozváni do skupiny "Skupina 1" */}
                    <p className="mt-1 text-sm text-[#3E4540]">
                      Byli jste pozváni do skupiny &quot;{notification.organization.name}&quot;
                    </p>

                    {/* Tlačítka Odmítnout a Přijmout přesně podle mockupu */}
                    <div className="mt-4 flex items-center gap-3">
                      {/* Tlačítko Odmítnout (světle béžové) */}
                      <button
                        type="button"
                        disabled={isButtonsDisabled}
                        onClick={() =>
                          handleReject(notification.id, notification.organization.name)
                        }
                        className="flex-1 rounded-xl border border-[#D9CDBF] bg-[#E8DCCF] px-4 py-2.5 text-center text-sm font-semibold text-[#1C261F] transition-all hover:bg-[#DDD0BF] active:scale-98 disabled:opacity-50"
                      >
                        {isItemProcessing && isRejecting ? (
                          <span className="inline-flex items-center justify-center gap-1.5">
                            <Spinner className="size-3.5 text-[#1C261F]" />
                            <span>Odmítání...</span>
                          </span>
                        ) : (
                          'Odmítnout'
                        )}
                      </button>

                      {/* Tlačítko Přijmout (tmavě zelené) */}
                      <button
                        type="button"
                        disabled={isButtonsDisabled}
                        onClick={() =>
                          handleAccept(notification.id, notification.organization.name)
                        }
                        className="flex-1 rounded-xl bg-[#1E3426] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#16271D] active:scale-98 disabled:opacity-50"
                      >
                        {isItemProcessing && isAccepting ? (
                          <span className="inline-flex items-center justify-center gap-1.5">
                            <Spinner className="size-3.5 text-white" />
                            <span>Přijímání...</span>
                          </span>
                        ) : (
                          'Přijmout'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { useNotifications, useRespondInvitation } from '@/hooks/use-invitations';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface NotificationInboxProps {
  onAcceptSuccess?: (organizationName?: string) => void;
  onRejectSuccess?: (organizationName?: string) => void;
  onlyPopup?: boolean;
}

export function NotificationInbox({
  onAcceptSuccess,
  onRejectSuccess,
  onlyPopup = true,
}: NotificationInboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, count, isLoading, refetch } = useNotifications();
  const { acceptInvitation, isAccepting, rejectInvitation, isRejecting, feedback } =
    useRespondInvitation();
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleAccept(id: string, organizationName?: string) {
    if (onlyPopup) {
      setIsOpen(false);
      onAcceptSuccess?.(organizationName);
      return;
    }
    setProcessingId(id);
    try {
      await acceptInvitation({ invitationId: id, organizationName });
      void refetch();
      onAcceptSuccess?.(organizationName);
    } catch {
      // Handled via hook feedback
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string, organizationName?: string) {
    if (onlyPopup) {
      setIsOpen(false);
      onRejectSuccess?.(organizationName);
      return;
    }
    setProcessingId(id);
    try {
      await rejectInvitation({ invitationId: id, organizationName });
      void refetch();
      onRejectSuccess?.(organizationName);
    } catch {
      // Handled via hook feedback
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9 rounded-full"
            aria-label={`Oznámení: ${count} nových pozvánek`}
          />
        }
      >
        <Bell className="size-5" />
        {count > 0 && (
          <span
            className="bg-destructive text-destructive-foreground absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold shadow-xs"
            data-testid="notifications-badge"
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="border-border bg-popover text-popover-foreground w-80 rounded-2xl p-0 shadow-lg sm:w-96"
      >
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight">Oznámení</h2>
          <span className="text-muted-foreground text-xs">{count} nevyřízených</span>
        </div>

        {feedback && (
          <div className="p-3">
            <div
              className={`relative rounded-xl border p-3 text-xs ${
                feedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
                  : feedback.type === 'info'
                    ? 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
                    : 'border-destructive/30 bg-destructive/10 text-destructive'
              }`}
            >
              <div className="flex items-start gap-2">
                {feedback.type === 'success' && (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                )}
                {feedback.type === 'info' && (
                  <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
                )}
                {feedback.type === 'error' && <AlertCircle className="mt-0.5 size-4 shrink-0" />}
                <div className="space-y-1">
                  <p className="leading-tight font-semibold">{feedback.title}</p>
                  <p className="text-[11px] opacity-90">{feedback.message}</p>
                  {feedback.code === 'CONNECTION_FAILED' && feedback.invitationId && (
                    <Button
                      type="button"
                      size="xs"
                      variant="destructive"
                      onClick={() =>
                        handleAccept(feedback.invitationId!, feedback.organizationName)
                      }
                      className="mt-1 gap-1"
                    >
                      <RefreshCw className="size-3" />
                      <span>Zkusit znovu</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-h-80 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Spinner className="text-primary size-5" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="border-border rounded-xl border border-dashed p-6 text-center">
              <Bell className="text-muted-foreground mx-auto size-5 opacity-50" />
              <p className="text-foreground mt-2 text-xs font-medium">Žádná nová oznámení</p>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                Nemáte žádné nevyřízené pozvánky.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((notification) => {
                const isItemProcessing = processingId === notification.id;
                const isButtonsDisabled = isItemProcessing || isAccepting || isRejecting;

                return (
                  <div
                    key={notification.id}
                    className="border-border bg-muted/40 hover:bg-muted/60 rounded-xl border p-3.5 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <h3 className="text-foreground text-xs font-bold">Pozvánka do skupiny</h3>
                      <p className="text-muted-foreground text-xs">
                        Byli jste pozváni do skupiny &quot;{notification.organization.name}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isButtonsDisabled}
                        onClick={() =>
                          handleReject(notification.id, notification.organization.name)
                        }
                        className="flex-1"
                      >
                        {isItemProcessing && isRejecting ? 'Odmítání...' : 'Odmítnout'}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        disabled={isButtonsDisabled}
                        onClick={() =>
                          handleAccept(notification.id, notification.organization.name)
                        }
                        className="flex-1"
                      >
                        {isItemProcessing && isAccepting ? 'Přijímání...' : 'Přijmout'}
                      </Button>
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

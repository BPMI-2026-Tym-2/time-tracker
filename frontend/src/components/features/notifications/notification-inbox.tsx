'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications, useRespondToInvitation } from '@/hooks/use-invitations';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export function NotificationInbox() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, count, isLoading, error, refetch } = useNotifications();
  const { mutate: respond, isPending, error: responseError } = useRespondToInvitation();

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) void refetch();
      }}
    >
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

        <div className="max-h-80 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Spinner className="text-primary size-5" />
            </div>
          ) : error ? (
            <div className="space-y-2 p-3 text-center">
              <p role="alert" className="text-destructive text-sm">
                Oznámení se nepodařilo načíst.
              </p>
              <Button variant="outline" size="sm" onClick={() => void refetch()}>
                Zkusit znovu
              </Button>
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
              {responseError && (
                <p role="alert" className="text-destructive text-sm">
                  {responseError.message}
                </p>
              )}
              {notifications.map((notification) => (
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
                      disabled={isPending}
                      onClick={() => respond({ invitationId: notification.id, action: 'reject' })}
                      className="flex-1"
                    >
                      Odmítnout
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      disabled={isPending}
                      onClick={() => respond({ invitationId: notification.id, action: 'accept' })}
                      className="flex-1"
                    >
                      Přijmout
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

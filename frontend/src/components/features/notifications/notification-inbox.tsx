'use client';

import { useState } from 'react';
import { Bell, Users, Check, X, Clock } from 'lucide-react';
import { useNotifications, useRespondInvitation } from '@/hooks/use-invitations';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export function NotificationInbox() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, count, isLoading, refetch } = useNotifications();
  const { acceptInvitation, isAccepting, rejectInvitation, isRejecting } = useRespondInvitation();
  const [activeId, setActiveId] = useState<string | null>(null);

  async function handleAccept(id: string) {
    setActiveId(id);
    try {
      await acceptInvitation(id);
      void refetch();
    } finally {
      setActiveId(null);
    }
  }

  async function handleReject(id: string) {
    setActiveId(id);
    try {
      await rejectInvitation(id);
      void refetch();
    } finally {
      setActiveId(null);
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            aria-label={`Oznámení: ${count} nových pozvánek`}
          >
            <Bell className="size-5" />
            {count > 0 && (
              <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Button>
        }
      />

      <PopoverContent align="end" className="w-80 p-0 sm:w-96">
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">Pozvánky do skupin</h3>
            {count > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                {count}
              </span>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner className="text-primary size-6" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-muted text-muted-foreground mx-auto flex size-10 items-center justify-center rounded-full">
                <Bell className="size-5" />
              </div>
              <p className="mt-2 text-sm font-medium">Žádné nové pozvánky</p>
              <p className="text-muted-foreground text-xs">
                Pokud vás někdo pozve do skupiny, pozvánka se zobrazí zde.
              </p>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {notifications.map((notification) => {
                const isItemProcessing = activeId === notification.id;
                const formattedDate = new Date(notification.createdAt).toLocaleDateString('cs-CZ', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div key={notification.id} className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                        <Users className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground text-sm font-semibold">Pozvánka do skupiny</p>
                        <p className="text-primary truncate text-xs font-bold">
                          {notification.organization.name}
                        </p>
                        <div className="text-muted-foreground mt-1 flex items-center gap-1 text-[11px]">
                          <Clock className="size-3" />
                          <span>Přijato: {formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={isItemProcessing || isAccepting || isRejecting}
                        onClick={() => handleReject(notification.id)}
                        className="gap-1.5"
                      >
                        <X className="size-3.5" />
                        <span>Odmítnout</span>
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        disabled={isItemProcessing || isAccepting || isRejecting}
                        onClick={() => handleAccept(notification.id)}
                        className="gap-1.5"
                      >
                        {isItemProcessing && isAccepting ? (
                          <Spinner className="size-3" />
                        ) : (
                          <Check className="size-3.5" />
                        )}
                        <span>Přijmout</span>
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

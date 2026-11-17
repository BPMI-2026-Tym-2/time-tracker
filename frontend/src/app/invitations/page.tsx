import { Suspense } from 'react';
import { Mail, UserPlus, Sparkles } from 'lucide-react';
import { InviteMemberDialog } from '@/components/features/groups/invite-member-dialog';
import { NotificationInbox } from '@/components/features/notifications/notification-inbox';
import { Spinner } from '@/components/ui/spinner';

export default function InvitationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Spinner className="text-primary size-8" />
        </div>
      }
    >
      <main className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Pozvánky do skupin</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Správa odesílání a přijímání pozvánek do skupin
              </p>
            </div>

            {/* Notification Bell in Header */}
            <div className="border-border bg-card flex items-center gap-3 rounded-2xl border px-4 py-2 shadow-xs">
              <span className="text-muted-foreground text-xs font-semibold">
                Oznámení a pozvánky:
              </span>
              <NotificationInbox />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Box 1: Odeslání pozvánky (Vlastník skupiny) */}
            <div className="border-border bg-card space-y-5 rounded-2xl border p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <UserPlus className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Odeslání pozvánky do skupiny</h2>
                  <p className="text-muted-foreground text-xs">Akce pro vlastníka skupiny</p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Jako vlastník můžete do své skupiny pozvat nové členy zadáním jejich e-mailové
                adresy. Pozvánka bude doručena do jejich schránky oznámení.
              </p>

              <div className="pt-2">
                <InviteMemberDialog
                  organizationId="org-tech"
                  organizationName="Programování a vývoj"
                />
              </div>
            </div>

            {/* Box 2: Schránka pozvánek (Pozvaný uživatel) */}
            <div className="border-border bg-card space-y-5 rounded-2xl border p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Mail className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Příchozí pozvánky</h2>
                  <p className="text-muted-foreground text-xs">Schránka oznámení uživatele</p>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Zde vidíte pozvánky, které vám byly zaslány od ostatních vlastníků skupin. Můžete
                pozvánku přijmout a stát se členem, nebo ji odmítnout.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <NotificationInbox />
                <span className="text-muted-foreground text-xs">
                  Klikněte na zvoneček pro otevření nabídky pozvánek
                </span>
              </div>
            </div>
          </div>

          {/* Info card */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-800">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="size-4" />
              <span>Napojení na backend:</span>
            </div>
            <p className="mt-1">
              Používá endpointy z PR #24:{' '}
              <code className="rounded bg-blue-100 px-1 py-0.5">
                POST /api/organizations/:id/invitations
              </code>
              , <code className="rounded bg-blue-100 px-1 py-0.5">GET /api/notifications</code> a{' '}
              <code className="rounded bg-blue-100 px-1 py-0.5">
                POST /api/auth/organization/accept-invitation
              </code>
              .
            </p>
          </div>
        </div>
      </main>
    </Suspense>
  );
}

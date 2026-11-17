'use client';

import { Suspense, useState } from 'react';
import {
  Users,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  Sparkles,
} from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { InviteMemberDialog } from '@/components/features/groups/invite-member-dialog';
import { Spinner } from '@/components/ui/spinner';

export default function GroupSettingsInvitationsPage() {
  const [simulateServerError, setSimulateServerError] = useState(false);
  const [invitedEmails, setInvitedEmails] = useState<string[]>(['daniel@seznam.cz']);

  function handleInviteSuccess(email: string) {
    if (!invitedEmails.includes(email)) {
      setInvitedEmails((prev) => [email, ...prev]);
    }
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
          <Spinner className="size-8 text-[#1E3426]" />
        </div>
      }
    >
      <div className="min-h-screen bg-[#F6F3ED] text-[#1C261F]">
        {/* Horní aplikační lišta */}
        <AppHeader userName="Emil" userInitials="EM" />

        <main className="mx-auto max-w-4xl space-y-8 p-6 md:p-10">
          {/* Hlavička BUC */}
          <div className="rounded-3xl border border-[#DFD8CC] bg-[#FAF7F2] p-8 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1E3426]/10 px-3 py-1 text-xs font-semibold text-[#1E3426]">
                  <Sparkles className="size-3.5" />
                  Business Use Case (BUC)
                </span>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-[#1C261F] sm:text-3xl">
                  Vytvoření pozvánky do skupiny
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-[#5E5A54]">
                  Vlastník skupiny v nastavení vybrané skupiny zvolí možnost{' '}
                  <strong>„Pozvat člena“</strong> za účelem pozvání dalšího uživatele do skupiny.
                </p>
              </div>
            </div>
          </div>

          {/* Přepínač scénářů pro testování A2 */}
          <div className="space-y-3 rounded-3xl border border-[#DFD8CC] bg-white/70 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-[#1C261F]">Režim testování odeslání pozvánky:</h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSimulateServerError(false)}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                  !simulateServerError
                    ? 'border-[#1E3426] bg-[#1E3426] text-white'
                    : 'border-[#DFD8CC] bg-[#FAF7F2] text-[#1C261F] hover:bg-[#EBE5DA]'
                }`}
              >
                Standardní režim (Happy Day / A1)
              </button>
              <button
                type="button"
                onClick={() => setSimulateServerError(true)}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                  simulateServerError
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-[#DFD8CC] bg-[#FAF7F2] text-[#1C261F] hover:bg-rose-50'
                }`}
              >
                Simulace chyby serveru (Tok A2)
              </button>
            </div>
          </div>

          {/* Sekce: Nastavení skupiny (HDS 1: Uživatel se nachází v nastavení vybrané skupiny) */}
          <div className="space-y-6 rounded-3xl border border-[#DFD8CC] bg-white p-8 shadow-xs">
            <div className="flex flex-col gap-4 border-b border-[#EAE3D6] pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#EAE2D5] text-[#1E3426]">
                  <Settings className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#1C261F]">Nastavení: Skupina 1</h2>
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      <ShieldCheck className="size-3" />
                      Vlastník (Owner)
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#5E5A54]">
                    ID: <code>org-skupina-1</code> • Spravujte členy a pozvánky do skupiny
                  </p>
                </div>
              </div>

              {/* HDS Krok 1 & 2: Tlačítko "Pozvat člena" otevírá dialog z mockupu */}
              <div>
                <InviteMemberDialog
                  organizationId="org-skupina-1"
                  organizationName="Skupina 1"
                  simulateError={simulateServerError}
                  onSuccess={handleInviteSuccess}
                />
              </div>
            </div>

            {/* Členové a pozvánky */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#1C261F]">
                <Users className="size-4 text-[#1E3426]" />
                <span>Aktivní členové skupiny</span>
              </h3>

              <div className="divide-y divide-[#EAE3D6] rounded-2xl border border-[#EAE3D6] bg-[#FAF7F2]">
                <div className="flex items-center justify-between p-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#1E3426] text-xs font-bold text-white">
                      EM
                    </div>
                    <div>
                      <p className="font-bold text-[#1C261F]">Emil (Vy)</p>
                      <p className="text-[#5E5A54]">emil@example.com</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-[#1E3426]/10 px-2.5 py-1 font-semibold text-[#1E3426]">
                    Vlastník
                  </span>
                </div>
              </div>
            </div>

            {/* Seznam čekajících pozvánek */}
            <div className="space-y-3 pt-2">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#1C261F]">
                <Mail className="size-4 text-[#1E3426]" />
                <span>Odeslané pozvánky do skupiny</span>
              </h3>

              {invitedEmails.length === 0 ? (
                <p className="text-xs text-[#5E5A54] italic">
                  Zatím jste do této skupiny neodeslali žádnou pozvánku.
                </p>
              ) : (
                <div className="divide-y divide-[#EAE3D6] rounded-2xl border border-[#EAE3D6] bg-[#FAF7F2]">
                  {invitedEmails.map((email) => (
                    <div key={email} className="flex items-center justify-between p-3.5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <Mail className="size-4 text-[#5E5A54]" />
                        <span className="font-medium text-[#1C261F]">{email}</span>
                      </div>
                      <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-medium text-amber-800">
                        Čeká na přijetí (pending)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Wireframe specifikace a mapování na BUC */}
          <div className="space-y-3 rounded-3xl border border-[#DFD8CC] bg-[#FAF7F2] p-6 text-xs text-[#5E5A54] shadow-xs">
            <h3 className="text-sm font-bold text-[#1C261F]">
              Specifikace komponenty z Wireframu:
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              <li className="flex items-start gap-2 rounded-xl border border-[#EAE3D6] bg-white/70 p-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <div>
                  <strong className="text-[#1C261F]">Pozvat člena (Nadpis):</strong>
                  <p className="mt-0.5">Nadpis dialogového okna pro vytvoření pozvánky.</p>
                </div>
              </li>
              <li className="flex items-start gap-2 rounded-xl border border-[#EAE3D6] bg-white/70 p-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <div>
                  <strong className="text-[#1C261F]">Popis pozvánky:</strong>
                  <p className="mt-0.5">
                    <code>Pozvěte nového člena do skupiny &quot;Skupina 1&quot;!</code>
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2 rounded-xl border border-[#EAE3D6] bg-white/70 p-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <div>
                  <strong className="text-[#1C261F]">E-mail uživatele:</strong>
                  <p className="mt-0.5">Krátké textové pole s validací e-mailu dle schématu.</p>
                </div>
              </li>
              <li className="flex items-start gap-2 rounded-xl border border-[#EAE3D6] bg-white/70 p-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <div>
                  <strong className="text-[#1C261F]">Tok A1 & A2:</strong>
                  <p className="mt-0.5">
                    Ověření formátu a možnost opakovat akci při chybě odeslání.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </Suspense>
  );
}

'use client';

import { Suspense, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Sparkles,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { InviteMemberDialog } from '@/components/features/groups/invite-member-dialog';
import { Spinner } from '@/components/ui/spinner';
import { useRespondInvitation, resetMockNotifications } from '@/hooks/use-invitations';
import type { InvitationErrorCode } from '@/lib/api/invitations';

export default function InvitationsPage() {
  const [activeScenario, setActiveScenario] = useState<InvitationErrorCode | undefined>(undefined);
  const { resetAllMockData } = useRespondInvitation();

  function handleReset() {
    resetMockNotifications();
    resetAllMockData();
    setActiveScenario(undefined);
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
        {/* Horní navigační lišta přesně dle screenshotu "Jak to vypadá v aplikaci:" */}
        <AppHeader userName="Emil" userInitials="EM" simulatedScenario={activeScenario} />

        <main className="mx-auto max-w-5xl space-y-8 p-6 md:p-10">
          {/* Úvodní hlavička stránky */}
          <div className="rounded-3xl border border-[#DFD8CC] bg-[#FAF7F2] p-8 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1E3426]/10 px-3 py-1 text-xs font-semibold text-[#1E3426]">
                  <Sparkles className="size-3.5" />
                  Business Use Case (BUC)
                </span>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-[#1C261F] sm:text-3xl">
                  Připojení se ke skupině pomocí pozvánky
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-[#5E5A54]">
                  Implementace frontendového rozhraní panelu <strong>Oznámení</strong> pro přijímání
                  a odmítání pozvánek do skupin dle specifikace a dodaného mockupu.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-[#D9CDBF] bg-[#E8DCCF] px-4 py-2.5 text-xs font-semibold text-[#1C261F] transition-colors hover:bg-[#DDD0BF] active:scale-95 sm:self-center"
              >
                <RefreshCw className="size-3.5" />
                <span>Obnovit výchozí stav</span>
              </button>
            </div>
          </div>

          {/* Interaktivní ovládací panel pro testování všech scénářů BUC */}
          <div className="space-y-4 rounded-3xl border border-[#DFD8CC] bg-white/70 p-6 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-[#1C261F]">
                Testování scénářů BUC v panelu Oznámení
              </h2>
              <p className="mt-0.5 text-xs text-[#5E5A54]">
                Vyberte scénář a klikněte na ikonu <strong>zvonku v horní liště</strong> pro
                vyzkoušení chování.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Happy Day */}
              <button
                type="button"
                onClick={() => setActiveScenario(undefined)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  activeScenario === undefined
                    ? 'border-[#1E3426] bg-[#1E3426]/10 ring-2 ring-[#1E3426]'
                    : 'border-[#DFD8CC] bg-[#FAF7F2] hover:border-[#1E3426]/50'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold text-[#1E3426]">
                  <CheckCircle2 className="size-4" />
                  <span>Happy Day</span>
                </div>
                <p className="mt-1 text-xs text-[#5E5A54]">
                  Ověření platnosti, přidání do skupiny s rolí member a potvrzení úspěchu.
                </p>
              </button>

              {/* Scénář A3 */}
              <button
                type="button"
                onClick={() => setActiveScenario('INVALID_OR_NOT_FOUND')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  activeScenario === 'INVALID_OR_NOT_FOUND'
                    ? 'border-rose-600 bg-rose-50 ring-2 ring-rose-600'
                    : 'border-[#DFD8CC] bg-[#FAF7F2] hover:border-rose-400'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold text-rose-700">
                  <ShieldAlert className="size-4" />
                  <span>Tok A3: Neplatná</span>
                </div>
                <p className="mt-1 text-xs text-[#5E5A54]">
                  Error Message: Pozvánku nelze přijmout. (vypršela nebo skupina neexistuje).
                </p>
              </button>

              {/* Scénář A4 */}
              <button
                type="button"
                onClick={() => setActiveScenario('ALREADY_MEMBER')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  activeScenario === 'ALREADY_MEMBER'
                    ? 'border-amber-600 bg-amber-50 ring-2 ring-amber-600'
                    : 'border-[#DFD8CC] bg-[#FAF7F2] hover:border-amber-400'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
                  <Info className="size-4" />
                  <span>Tok A4: Již členem</span>
                </div>
                <p className="mt-1 text-xs text-[#5E5A54]">
                  Information Message: Jste již členem této skupiny.
                </p>
              </button>

              {/* Scénář A5 */}
              <button
                type="button"
                onClick={() => setActiveScenario('CONNECTION_FAILED')}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  activeScenario === 'CONNECTION_FAILED'
                    ? 'border-red-600 bg-red-50 ring-2 ring-red-600'
                    : 'border-[#DFD8CC] bg-[#FAF7F2] hover:border-red-400'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold text-red-700">
                  <AlertCircle className="size-4" />
                  <span>Tok A5: Selhání</span>
                </div>
                <p className="mt-1 text-xs text-[#5E5A54]">
                  Error Message: Nepodařilo se připojit ke skupině + tlačítko pro opakování.
                </p>
              </button>
            </div>
          </div>

          {/* Sekce s dialogem pro pozvání nového člena (propojení s odesíláním pozvánek) */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-3xl border border-[#DFD8CC] bg-[#FAF7F2] p-6 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#1E3426] text-white">
                  <Users className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1C261F]">Vytvořit pozvánku do skupiny</h3>
                  <p className="text-xs text-[#5E5A54]">Odeslání pozvánky na e-mail</p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-[#5E5A54]">
                Vlastník skupiny může pozvat dalšího člena. Po odeslání se pozvánka ihned objeví ve
                schránce oznámení pozvaného uživatele (červený odznak na zvonku).
              </p>

              <div className="pt-2">
                <InviteMemberDialog organizationId="org-skupina-1" organizationName="Skupina 1" />
              </div>
            </div>

            {/* Specifikace toků */}
            <div className="space-y-3 rounded-3xl border border-[#DFD8CC] bg-[#FAF7F2] p-6 shadow-xs">
              <h3 className="flex items-center gap-2 font-bold text-[#1C261F]">
                <Bell className="size-4 text-[#1E3426]" />
                <span>Souhrn prvků z Mockupu & Wireframu</span>
              </h3>
              <ul className="space-y-2 text-xs text-[#5E5A54]">
                <li className="flex items-start gap-2">
                  <span className="shrink-0 font-bold text-[#1C261F]">• Zvonek:</span>
                  <span>Tlačítko s ikonou zvonku a červeným kolečkem (unreadCount).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 font-bold text-[#1C261F]">• Oznámení:</span>
                  <span>Nadpis otevřeného panelu s tlačítkem pro zavření (x).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 font-bold text-[#1C261F]">• Pozvánka:</span>
                  <span>
                    Karta s textem <code>Byli jste pozváni do skupiny &quot;Skupina 1&quot;</code>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="shrink-0 font-bold text-[#1C261F]">• Tlačítka:</span>
                  <span>
                    Béžové <strong>Odmítnout</strong> a tmavě zelené <strong>Přijmout</strong>.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </Suspense>
  );
}

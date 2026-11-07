'use client';

import { useState } from 'react';
import {
  Info,
  Camera,
  Users,
  FileText,
  Link as LinkIcon,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LOGO_PRESETS } from '../group-settings.constants';

type BasicInfoCardProps = {
  name: string;
  setName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  ownerName: string;
  invitationCode: string;
  copiedCode: boolean;
  canEdit: boolean;
  selectedLogo: string;
  setSelectedLogo: (val: string) => void;
  onCopyCode: () => void;
  onGenerateCode: () => void;
};

export function BasicInfoCard({
  name,
  setName,
  description,
  setDescription,
  ownerName,
  invitationCode,
  copiedCode,
  canEdit,
  selectedLogo,
  setSelectedLogo,
  onCopyCode,
  onGenerateCode,
}: BasicInfoCardProps) {
  const [isChoosingLogo, setIsChoosingLogo] = useState(false);
  const CurrentLogoIcon = LOGO_PRESETS.find((p) => p.id === selectedLogo)?.icon ?? Users;

  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="pt-5 pb-4">
        <div className="flex items-center gap-2 text-slate-800">
          <Info className="h-4 w-4 text-slate-500" />
          <CardTitle className="text-sm font-semibold tracking-wide text-slate-900">
            Základní informace
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[140px_1fr]">
          {/* Logo a výběr ikony */}
          <div className="flex flex-col items-center gap-2.5 pt-1">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-sm ring-4 ring-blue-50/50">
              <CurrentLogoIcon className="h-11 w-11" />
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsChoosingLogo((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
              >
                <Camera className="h-3.5 w-3.5 text-slate-500" />
                <span>Změnit logo</span>
              </button>
            )}

            {isChoosingLogo && canEdit && (
              <div className="w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <div className="grid grid-cols-3 gap-1.5">
                  {LOGO_PRESETS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = selectedLogo === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedLogo(item.id);
                          setIsChoosingLogo(false);
                        }}
                        className={`flex h-8 w-full items-center justify-center rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                        title={item.label}
                      >
                        <IconComp className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Vstupní formulářová pole */}
          <div className="space-y-4">
            {/* Název skupiny */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span>Název skupiny</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canEdit}
                maxLength={100}
                placeholder="Skupina 1"
                className="w-full rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Popis skupiny */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr] sm:items-start">
              <label className="flex items-center gap-2 pt-1.5 text-xs font-medium text-slate-700">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>Popis skupiny</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canEdit}
                rows={2}
                maxLength={500}
                placeholder="Sdílený prostor pro plánování aktivit, záznamy a spolupráci členů skupiny."
                className="w-full resize-none rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            {/* Vlastník skupiny (read-only) */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span>Vlastník skupiny</span>
              </label>
              <div className="flex h-8 items-center rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 text-xs text-slate-800">
                {ownerName || 'Neuveden'}
              </div>
            </div>

            {/* Pozvánkový kód */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                <span>Pozvánkový kód</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={invitationCode}
                    className="w-full rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 py-1.5 pr-9 font-mono text-xs tracking-wider text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={onCopyCode}
                    className="absolute top-1/2 right-1.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200/70 hover:text-slate-900"
                    title="Zkopírovat pozvánkový kód"
                  >
                    {copiedCode ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={onGenerateCode}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-blue-600"
                    title="Vygenerovat nový pozvánkový kód skupiny"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                    <span>Vygenerovat kód</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

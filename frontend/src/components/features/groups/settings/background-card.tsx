'use client';

import { Image as ImageIcon, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BACKGROUND_THEMES } from '../group-settings.constants';

type BackgroundCardProps = {
  selectedColor: string;
  setSelectedColor: (val: string) => void;
  canEdit: boolean;
};

function ThemeIllustration({ id }: { id: string }) {
  if (id === 'blue-sky') {
    return (
      <svg viewBox="0 0 100 60" className="h-full w-full object-cover">
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <rect width="100" height="60" fill="url(#skyGrad)" />
        <path d="M0 40 Q 35 25 70 42 T 100 35 L 100 60 L 0 60 Z" fill="#60a5fa" opacity="0.6" />
        <path d="M0 48 Q 40 38 75 50 T 100 45 L 100 60 L 0 60 Z" fill="#2563eb" opacity="0.7" />
      </svg>
    );
  }
  if (id === 'sunset') {
    return (
      <svg viewBox="0 0 100 60" className="h-full w-full object-cover">
        <defs>
          <linearGradient id="sunsetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="45%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
        </defs>
        <rect width="100" height="60" fill="url(#sunsetGrad)" />
        <path
          d="M0 36 L 25 24 L 50 38 L 75 22 L 100 34 L 100 60 L 0 60 Z"
          fill="#c084fc"
          opacity="0.45"
        />
        <path d="M0 46 L 35 34 L 65 46 L 100 36 L 100 60 L 0 60 Z" fill="#6b21a8" opacity="0.75" />
      </svg>
    );
  }
  if (id === 'forest') {
    return (
      <svg viewBox="0 0 100 60" className="h-full w-full object-cover">
        <defs>
          <linearGradient id="forestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="60%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
        </defs>
        <rect width="100" height="60" fill="url(#forestGrad)" />
        <polygon points="12,18 7,38 17,38" fill="#022c22" opacity="0.7" />
        <polygon points="28,14 20,40 36,40" fill="#022c22" opacity="0.8" />
        <polygon points="46,16 38,38 54,38" fill="#022c22" opacity="0.7" />
        <polygon points="68,10 58,42 78,42" fill="#022c22" opacity="0.9" />
        <polygon points="86,18 78,38 94,38" fill="#022c22" opacity="0.8" />
        <rect y="36" width="100" height="24" fill="#022c22" opacity="0.95" />
      </svg>
    );
  }
  if (id === 'navy') {
    return (
      <svg viewBox="0 0 100 60" className="h-full w-full object-cover">
        <defs>
          <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#020617" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
        <rect width="100" height="60" fill="url(#navyGrad)" />
        <path d="M0 25 Q 50 65 100 20 L 100 60 L 0 60 Z" fill="#0284c7" opacity="0.35" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 60" className="h-full w-full object-cover">
      <defs>
        <linearGradient id="abstractGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="50%" stopColor="#ddd6fe" />
          <stop offset="100%" stopColor="#f5d0fe" />
        </linearGradient>
      </defs>
      <rect width="100" height="60" fill="url(#abstractGrad)" />
      <path d="M-10 25 Q 30 65 70 25 T 110 55 L 100 60 L 0 60 Z" fill="#c4b5fd" opacity="0.55" />
    </svg>
  );
}

export function BackgroundCard({ selectedColor, setSelectedColor, canEdit }: BackgroundCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="px-6 pt-4 pb-1.5">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-slate-500" />
          <CardTitle className="text-sm font-semibold text-slate-900">Pozadí skupiny</CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500">
          Vyberte vizuální motiv, který se bude zobrazovat v rámci skupiny.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pt-1 pb-6">
        <div className="grid grid-cols-5 gap-2.5">
          {BACKGROUND_THEMES.map((theme) => {
            const isSelected = selectedColor === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                disabled={!canEdit}
                onClick={() => setSelectedColor(theme.id)}
                className={`group relative h-13 w-full overflow-hidden rounded-xl shadow-xs transition-all sm:h-14 ${
                  isSelected
                    ? 'border-2 border-blue-500 ring-2 ring-blue-500/20'
                    : 'border border-slate-200/60 opacity-90 hover:border-slate-300 hover:opacity-100'
                } disabled:cursor-not-allowed`}
                title={theme.name}
              >
                <ThemeIllustration id={theme.id} />
                {isSelected && (
                  <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center pt-1.5">
          {canEdit && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
            >
              <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
              <span>Změnit pozadí</span>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

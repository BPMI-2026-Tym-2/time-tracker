'use client';

import { Image as ImageIcon, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BACKGROUND_THEMES } from '../group-settings.constants';

type BackgroundCardProps = {
  selectedColor: string;
  setSelectedColor: (val: string) => void;
  canEdit: boolean;
};

export function BackgroundCard({ selectedColor, setSelectedColor, canEdit }: BackgroundCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="pt-4 pb-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-slate-500" />
          <CardTitle className="text-sm font-semibold text-slate-900">Pozadí skupiny</CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500">
          Vyberte vizuální motiv, který se bude zobrazovat v rámci skupiny.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-1 pb-5">
        <div className="grid grid-cols-5 gap-2">
          {BACKGROUND_THEMES.map((theme) => {
            const isSelected = selectedColor === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                disabled={!canEdit}
                onClick={() => setSelectedColor(theme.id)}
                className={`relative h-12 w-full rounded-xl transition-all ${theme.previewClass} ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'opacity-85 hover:opacity-100'
                } disabled:cursor-not-allowed`}
                title={theme.name}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-white shadow-xs">
                    <Check className="h-2 w-2 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center pt-1">
          {canEdit && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
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

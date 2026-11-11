'use client';

import { Tag, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CATEGORY_PRESETS } from '../group-settings.constants';

type CategoriesCardProps = {
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  canEdit: boolean;
};

export function CategoriesCard({
  selectedCategory,
  setSelectedCategory,
  canEdit,
}: CategoriesCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="px-6 pt-4 pb-1.5">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-slate-500" />
          <CardTitle className="text-sm font-semibold text-slate-900">Kategorie skupiny</CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500">
          Vyberte kategorii, která nejlépe vystihuje zaměření skupiny.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pt-2 pb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_PRESETS.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const IconComp = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                disabled={!canEdit}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/80 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                {IconComp && <IconComp className="h-3.5 w-3.5 text-slate-500" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

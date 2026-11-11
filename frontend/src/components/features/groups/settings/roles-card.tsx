'use client';

import { Shield, Crown, Settings, Users, Check, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type RolesCardProps = {
  adminCanAssign: boolean;
  setAdminCanAssign: (val: boolean) => void;
  adminCanRemove: boolean;
  setAdminCanRemove: (val: boolean) => void;
  canEdit?: boolean;
};

function CheckboxBadge({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-md bg-blue-600 text-white shadow-2xs">
        <Check className="h-3 w-3 stroke-[3]" />
      </span>
    );
  }
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-md border border-slate-300 bg-white" />
  );
}

export function RolesCard({
  adminCanAssign,
  setAdminCanAssign,
  adminCanRemove,
  setAdminCanRemove,
}: RolesCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="px-6 pt-4 pb-1.5">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-slate-500" />
          <CardTitle className="text-sm font-semibold text-slate-900">Role a oprávnění</CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500">
          Nastavte role ve skupině a jejich oprávnění.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pt-1 pb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] text-slate-400">
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Popis a hlavní oprávnění</th>
                <th className="pb-2 text-center font-medium">
                  <span className="inline-flex items-center gap-0.5">
                    Může přiřazovat role <Info className="h-3 w-3 text-slate-400" />
                  </span>
                </th>
                <th className="pb-2 text-center font-medium">
                  <span className="inline-flex items-center gap-0.5">
                    Může odstraňovat členy <Info className="h-3 w-3 text-slate-400" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px] text-slate-700">
              <tr>
                <td className="py-2.5 font-medium text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                    <span>Vlastník</span>
                  </div>
                </td>
                <td className="py-2.5 text-slate-500">Plná správa skupiny, všechny oprávnění.</td>
                <td className="py-2.5 text-center">
                  <CheckboxBadge checked={true} />
                </td>
                <td className="py-2.5 text-center">
                  <CheckboxBadge checked={true} />
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-900">
                  <div className="flex items-center gap-1.5">
                    <Settings className="h-3.5 w-3.5 text-slate-500" />
                    <span>Administrátor</span>
                  </div>
                </td>
                <td className="py-2.5 text-slate-500">Správa členů a obsahu skupiny.</td>
                <td className="py-2.5 text-center">
                  <button
                    type="button"
                    onClick={() => setAdminCanAssign(!adminCanAssign)}
                    disabled
                    title="Správa oprávnění rolí bude dostupná v navazujícím use casu"
                    className="disabled:cursor-not-allowed"
                  >
                    <CheckboxBadge checked={adminCanAssign} />
                  </button>
                </td>
                <td className="py-2.5 text-center">
                  <button
                    type="button"
                    onClick={() => setAdminCanRemove(!adminCanRemove)}
                    disabled
                    title="Správa oprávnění rolí bude dostupná v navazujícím use casu"
                    className="disabled:cursor-not-allowed"
                  >
                    <CheckboxBadge checked={adminCanRemove} />
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>Člen</span>
                  </div>
                </td>
                <td className="py-2.5 text-slate-500">Základní přístup k aktivitám a obsahu.</td>
                <td className="py-2.5 text-center">
                  <CheckboxBadge checked={false} />
                </td>
                <td className="py-2.5 text-center">
                  <CheckboxBadge checked={false} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

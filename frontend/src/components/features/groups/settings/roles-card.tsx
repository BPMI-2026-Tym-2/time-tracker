'use client';

import { ShieldCheck, Shield, Crown, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type RolesCardProps = {
  adminCanAssign: boolean;
  setAdminCanAssign: (val: boolean) => void;
  adminCanRemove: boolean;
  setAdminCanRemove: (val: boolean) => void;
  canEdit?: boolean;
};

export function RolesCard({
  adminCanAssign,
  setAdminCanAssign,
  adminCanRemove,
  setAdminCanRemove,
}: RolesCardProps) {
  return (
    <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
      <CardHeader className="pt-4 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-slate-500" />
          <CardTitle className="text-sm font-semibold text-slate-900">Role a oprávnění</CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500">
          Nastavte role ve skupině a jejich oprávnění.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-1 pb-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] text-slate-400">
                <th className="pb-1.5 font-medium">Role</th>
                <th className="pb-1.5 font-medium">Popis a hlavní oprávnění</th>
                <th className="pb-1.5 text-center font-medium">Může přiřazovat role ⓘ</th>
                <th className="pb-1.5 text-center font-medium">Může odstraňovat členy ⓘ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[11px] text-slate-700">
              <tr>
                <td className="flex items-center gap-1.5 py-2 font-medium text-slate-900">
                  <Crown className="h-3 w-3 text-amber-500" />
                  <span>Vlastník</span>
                </td>
                <td className="py-2 text-slate-500">Plná správa skupiny, všechny oprávnění.</td>
                <td className="py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    readOnly
                    className="h-3.5 w-3.5 rounded accent-blue-600"
                  />
                </td>
                <td className="py-2 text-center">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    readOnly
                    className="h-3.5 w-3.5 rounded accent-blue-600"
                  />
                </td>
              </tr>
              <tr>
                <td className="flex items-center gap-1.5 py-2 font-medium text-slate-900">
                  <Shield className="h-3 w-3 text-blue-500" />
                  <span>Administrátor</span>
                </td>
                <td className="py-2 text-slate-500">Správa členů a obsahu skupiny.</td>
                <td className="py-2 text-center">
                  <input
                    type="checkbox"
                    checked={adminCanAssign}
                    onChange={(e) => setAdminCanAssign(e.target.checked)}
                    disabled
                    title="Správa oprávnění rolí bude dostupná v navazujícím use casu"
                    className="h-3.5 w-3.5 rounded accent-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </td>
                <td className="py-2 text-center">
                  <input
                    type="checkbox"
                    checked={adminCanRemove}
                    onChange={(e) => setAdminCanRemove(e.target.checked)}
                    disabled
                    title="Správa oprávnění rolí bude dostupná v navazujícím use casu"
                    className="h-3.5 w-3.5 rounded accent-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </td>
              </tr>
              <tr>
                <td className="flex items-center gap-1.5 py-2 font-medium text-slate-800">
                  <Users className="h-3 w-3 text-slate-400" />
                  <span>Člen</span>
                </td>
                <td className="py-2 text-slate-500">Základní přístup k aktivitám a obsahu.</td>
                <td className="py-2 text-center">
                  <input type="checkbox" disabled className="h-3.5 w-3.5 rounded" />
                </td>
                <td className="py-2 text-center">
                  <input type="checkbox" disabled className="h-3.5 w-3.5 rounded" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

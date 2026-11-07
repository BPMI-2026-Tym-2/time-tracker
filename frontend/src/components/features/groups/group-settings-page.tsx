'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type {
  GroupMemberResponse,
  GroupSettingsResponse,
  UpdateGroupSettingsBody,
} from '@time-tracker/shared';
import {
  Users,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Tag,
  Rocket,
  Code,
  Flame,
  Zap,
  Target,
  Globe,
  Star,
  Folder,
  AlertCircle,
  Info,
  Pencil,
  FileText,
  Link as LinkIcon,
  LayoutDashboard,
  LayoutGrid,
  GraduationCap,
  Briefcase,
  Coffee,
  MoreHorizontal,
  UserPlus,
  Trash2,
  Image as ImageIcon,
  Camera,
  Crown,
  ChevronDown,
} from 'lucide-react';
import { useGroupSettings } from '@/hooks/use-group-settings';
import { fetchGroupMembers } from '@/lib/api/groups';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type GroupSettingsPageProps = {
  groupId: string;
};

const LOGO_PRESETS = [
  { id: 'users', label: 'Tým', icon: Users },
  { id: 'rocket', label: 'Raketa', icon: Rocket },
  { id: 'code', label: 'Kód', icon: Code },
  { id: 'flame', label: 'Oheň', icon: Flame },
  { id: 'zap', label: 'Blesk', icon: Zap },
  { id: 'target', label: 'Cíl', icon: Target },
  { id: 'globe', label: 'Svět', icon: Globe },
  { id: 'star', label: 'Hvězda', icon: Star },
  { id: 'folder', label: 'Projekt', icon: Folder },
] as const;

const CATEGORY_PRESETS = [
  { id: 'Obecná', label: 'Obecná', icon: null },
  { id: 'Studium', label: 'Studium', icon: GraduationCap },
  { id: 'Projekt', label: 'Projekt', icon: Briefcase },
  { id: 'Volný čas', label: 'Volný čas', icon: Coffee },
  { id: 'Ostatní', label: 'Ostatní', icon: MoreHorizontal },
] as const;

const BACKGROUND_THEMES = [
  {
    id: 'blue-sky',
    name: 'Modrá obloha',
    previewClass:
      'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-300 via-sky-400 to-blue-600',
  },
  {
    id: 'sunset',
    name: 'Západ slunce',
    previewClass: 'bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500',
  },
  {
    id: 'forest',
    name: 'Mlžný les',
    previewClass: 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900',
  },
  {
    id: 'navy',
    name: 'Hluboká modř',
    previewClass: 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950',
  },
  {
    id: 'abstract',
    name: 'Pastelové vlny',
    previewClass: 'bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-300',
  },
] as const;

function GroupSettingsForm({
  settings,
  updateSettings,
}: {
  settings: GroupSettingsResponse;
  updateSettings: (body: UpdateGroupSettingsBody) => Promise<GroupSettingsResponse | null>;
}) {
  const canEdit = settings.permissions.canEdit;

  const [baseline, setBaseline] = useState<GroupSettingsResponse>(settings);
  const [name, setName] = useState(settings.name);
  const [description, setDescription] = useState(
    settings.description && settings.description !== 'Bez popisku'
      ? settings.description
      : 'Sdílený prostor pro plánování aktivit, záznamy a spolupráci členů skupiny.',
  );
  const [selectedLogo, setSelectedLogo] = useState(settings.logo ?? 'users');
  const [selectedCategory, setSelectedCategory] = useState(settings.category ?? 'Obecná');
  const [selectedColor, setSelectedColor] = useState(settings.color ?? 'blue-sky');
  const [isChoosingLogo, setIsChoosingLogo] = useState(false);

  const [members, setMembers] = useState<GroupMemberResponse[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [invitationCode, setInvitationCode] = useState(
    settings.invitationCode ?? settings.id.replace(/-/g, '').slice(0, 6).toUpperCase(),
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [showDeleteNotice, setShowDeleteNotice] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<GroupMemberResponse | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isGroupDeleted, setIsGroupDeleted] = useState(false);
  const [adminCanAssign, setAdminCanAssign] = useState(true);
  const [adminCanRemove, setAdminCanRemove] = useState(true);

  function handleGenerateInvitationCode() {
    if (!canEdit) return;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let newCode = '';
    for (let i = 0; i < 6; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInvitationCode(newCode);
  }

  // Načtení skutečných členů ze serverového endpointu
  useEffect(() => {
    let active = true;
    async function loadMembers() {
      try {
        setIsLoadingMembers(true);
        const result = await fetchGroupMembers(settings.id);
        if (active) {
          setMembers(result.items);
          setMembersError(null);
        }
      } catch (err) {
        if (active) {
          setMembersError(
            err instanceof Error ? err.message : 'Nepodařilo se načíst seznam členů skupiny',
          );
        }
      } finally {
        if (active) {
          setIsLoadingMembers(false);
        }
      }
    }
    void loadMembers();
    return () => {
      active = false;
    };
  }, [settings.id]);

  // Posílat v PATCH pouze pole, která byla skutečně změněna oproti baseline
  const diffPayload: UpdateGroupSettingsBody = {};
  if (name !== baseline.name) diffPayload.name = name;
  if (description !== (baseline.description ?? '')) diffPayload.description = description;
  if (selectedLogo !== (baseline.logo ?? 'users')) diffPayload.logo = selectedLogo;
  if (selectedCategory !== (baseline.category ?? 'Obecná')) diffPayload.category = selectedCategory;
  if (selectedColor !== (baseline.color ?? 'blue-sky')) diffPayload.color = selectedColor;
  if (
    invitationCode !==
    (baseline.invitationCode ?? baseline.id.replace(/-/g, '').slice(0, 6).toUpperCase())
  ) {
    diffPayload.invitationCode = invitationCode;
  }

  const hasUnsavedChanges = Object.keys(diffPayload).length > 0;

  // A1: Zrušení provedených změn (reset do baseline)
  function handleResetChanges() {
    setName(baseline.name);
    setDescription(
      baseline.description && baseline.description !== 'Bez popisku'
        ? baseline.description
        : 'Sdílený prostor pro plánování aktivit, záznamy a spolupráci členů skupiny.',
    );
    setSelectedLogo(baseline.logo ?? 'users');
    setSelectedCategory(baseline.category ?? 'Obecná');
    setSelectedColor(baseline.color ?? 'blue-sky');
    setInvitationCode(
      baseline.invitationCode ?? baseline.id.replace(/-/g, '').slice(0, 6).toUpperCase(),
    );
    setSaveError(null);
    setSaveSuccessMsg(null);
    setIsChoosingLogo(false);
  }

  // Uložení změn na server
  async function handleSaveChanges() {
    if (!canEdit || !hasUnsavedChanges) return;

    if (!name.trim()) {
      setSaveError('Název skupiny nesmí být prázdný');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccessMsg(null);

      const updated = await updateSettings(diffPayload);
      if (updated) {
        setBaseline(updated);
        setName(updated.name);
        setDescription(
          updated.description && updated.description !== 'Bez popisku'
            ? updated.description
            : 'Sdílený prostor pro plánování aktivit, záznamy a spolupráci členů skupiny.',
        );
        setSelectedLogo(updated.logo ?? 'users');
        setSelectedCategory(updated.category ?? 'Obecná');
        setSelectedColor(updated.color ?? 'blue-sky');
        setInvitationCode(
          updated.invitationCode ?? updated.id.replace(/-/g, '').slice(0, 6).toUpperCase(),
        );

        setSaveSuccessMsg('Nastavení skupiny bylo úspěšně uloženo.');
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Uložení nastavení skupiny selhalo');
    } finally {
      setIsSaving(false);
    }
  }

  function handleCopyInvitationCode() {
    void navigator.clipboard.writeText(invitationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  const CurrentLogoIcon = LOGO_PRESETS.find((p) => p.id === selectedLogo)?.icon ?? Users;

  // Jméno vlastníka pro zobrazení
  const ownerDisplayName = settings.owner
    ? `${settings.owner.name} ${settings.owner.surname}`.trim()
    : '';

  if (isGroupDeleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Trash2 className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Skupina byla odstraněna</h2>
          <p className="mt-2 text-xs text-slate-600">
            Skupina <strong className="text-slate-800">{name}</strong> byla úspěšně odstraněna v
            souladu s alternativním tokem A4.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zpět na přehled</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Postranní navigace (Sidebar) přesně podle obrázku */}
      <aside className="hidden w-56 shrink-0 border-r border-slate-200/70 bg-white p-4 md:block">
        <nav className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-500" />
            <span>Přehled</span>
          </Link>
          <div className="flex items-center gap-3 rounded-xl bg-blue-50/80 px-3 py-2 text-sm font-semibold text-blue-600">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Skupiny</span>
          </div>
          <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400">
            <LayoutGrid className="h-4 w-4" />
            <span>Kategorie</span>
          </div>
          <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400">
            <Tag className="h-4 w-4" />
            <span>Tagy</span>
          </div>
        </nav>
      </aside>

      {/* Hlavní obsahová část */}
      <main className="flex-1 p-6 sm:p-8">
        <div className="mx-auto max-w-5xl space-y-5">
          {/* Záhlaví stránky */}
          <div className="pb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nastavení skupiny</h1>
          </div>

          {/* Hlášení o chybě / úspěchu */}
          {saveError && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              <div className="flex-1">
                <span className="font-semibold">Chyba při ukládání změn:</span> {saveError}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleSaveChanges()}
                className="h-8 border-red-200 bg-white text-red-700 hover:bg-red-50"
              >
                Zkusit znovu
              </Button>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <Check className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* KARTA 1: Základní informace */}
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
                {/* Logo a tlačítko změnit */}
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

                  {/* Volba loga při rozkliknutí */}
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
                              className={`flex flex-col items-center justify-center rounded-lg p-1.5 transition-all ${
                                isSelected
                                  ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500'
                                  : 'text-slate-600 hover:bg-slate-100'
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

                {/* Formulářová pole základních informací */}
                <div className="space-y-3.5">
                  {/* Název skupiny */}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr] sm:items-center">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <Pencil className="h-3.5 w-3.5 text-slate-400" />
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
                      {ownerDisplayName}
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
                          onClick={handleCopyInvitationCode}
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
                          onClick={handleGenerateInvitationCode}
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

          {/* DVOJSLOUPEC 1: Kategorie & Role */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* KARTA 2: Kategorie skupiny */}
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
              <CardHeader className="pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-500" />
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    Kategorie skupiny
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  Vyberte kategorii, která nejlépe vystihuje zaměření skupiny.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 pb-5">
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
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-blue-400 bg-blue-50/80 text-blue-600 shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 stroke-[2.5] text-blue-600" />
                        ) : IconComp ? (
                          <IconComp className="h-3.5 w-3.5 text-slate-400" />
                        ) : null}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* KARTA 3: Role a oprávnění */}
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
              <CardHeader className="pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    Role a oprávnění
                  </CardTitle>
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
                        <td className="py-2 text-slate-500">
                          Plná správa skupiny, všechny oprávnění.
                        </td>
                        <td className="py-2 text-center">
                          <input
                            type="checkbox"
                            checked
                            disabled
                            className="h-3.5 w-3.5 rounded accent-blue-600"
                          />
                        </td>
                        <td className="py-2 text-center">
                          <input
                            type="checkbox"
                            checked
                            disabled
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
                            disabled={!canEdit}
                            className="h-3.5 w-3.5 rounded accent-blue-600 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="py-2 text-center">
                          <input
                            type="checkbox"
                            checked={adminCanRemove}
                            onChange={(e) => setAdminCanRemove(e.target.checked)}
                            disabled={!canEdit}
                            className="h-3.5 w-3.5 rounded accent-blue-600 disabled:cursor-not-allowed"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="flex items-center gap-1.5 py-2 font-medium text-slate-800">
                          <Users className="h-3 w-3 text-slate-400" />
                          <span>Člen</span>
                        </td>
                        <td className="py-2 text-slate-500">
                          Základní přístup k aktivitám a obsahu.
                        </td>
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
          </div>

          {/* DVOJSLOUPEC 2: Členové skupiny & Pozadí skupiny */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* KARTA 4: Členové skupiny */}
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pt-4 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      Členové skupiny
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-slate-500">
                    Spravujte členy skupiny a jejich role.
                  </CardDescription>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-slate-500" />
                    <span>Pozvat člena</span>
                  </button>
                )}
              </CardHeader>
              <CardContent className="space-y-2 pt-1 pb-5">
                {isLoadingMembers ? (
                  <div className="space-y-1.5 py-1">
                    <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
                    <div className="h-9 animate-pulse rounded-lg bg-slate-100" />
                  </div>
                ) : membersError ? (
                  <p className="text-xs text-red-600">{membersError}</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {/* Zobrazení členů podle mockupu s interaktivní změnou role a odstraněním */}
                    {members.length > 0 ? (
                      members.map((member) => {
                        const isOwner = member.role === 'owner';
                        return (
                          <div
                            key={member.id}
                            className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Users className="h-3.5 w-3.5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1 text-xs font-medium text-slate-900">
                                  <span>
                                    {member.name} {member.surname}
                                  </span>
                                  {isOwner && <Crown className="h-2.5 w-2.5 text-amber-500" />}
                                </div>
                                {isOwner && (
                                  <span className="text-[10px] text-slate-400">Vlastník</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isOwner ? (
                                <div className="flex h-6 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-medium text-slate-700">
                                  Vlastník
                                </div>
                              ) : canEdit ? (
                                <div className="relative">
                                  <select
                                    value={member.role === 'admin' ? 'Administrátor' : 'Člen'}
                                    onChange={(e) => {
                                      const newRole =
                                        e.target.value === 'Administrátor' ? 'admin' : 'member';
                                      setMembers((prev) =>
                                        prev.map((m) =>
                                          m.id === member.id ? { ...m, role: newRole } : m,
                                        ),
                                      );
                                    }}
                                    className="h-6 appearance-none rounded-md border border-slate-200 bg-white pr-6 pl-2 text-[11px] font-medium text-slate-700 hover:bg-slate-50 focus:border-blue-500 focus:outline-none"
                                  >
                                    <option value="Administrátor">Administrátor</option>
                                    <option value="Člen">Člen</option>
                                  </select>
                                  <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-slate-400" />
                                </div>
                              ) : (
                                <div className="flex h-6 items-center rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-700">
                                  {member.role === 'admin' ? 'Administrátor' : 'Člen'}
                                </div>
                              )}
                              {!isOwner && canEdit && (
                                <button
                                  type="button"
                                  onClick={() => setMemberToDelete(member)}
                                  className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                  title={`Odstranit člena ${member.name} ${member.surname}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-2 text-xs text-slate-500">Žádní členové nenalezeni</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* KARTA 5: Pozadí skupiny */}
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-xs">
              <CardHeader className="pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    Pozadí skupiny
                  </CardTitle>
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
                          isSelected
                            ? 'ring-2 ring-blue-500 ring-offset-2'
                            : 'opacity-85 hover:opacity-100'
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
          </div>

          {/* SPODNÍ AKČNÍ LIŠTA */}
          <div className="flex items-center justify-between pt-3">
            {/* Tlačítko Odstranit skupinu přesně podle mockupu */}
            <div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setShowDeleteNotice(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Odstranit skupinu</span>
                </button>
              )}
            </div>

            {/* Tlačítka Zrušit a Uložit na pravé straně */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetChanges}
                disabled={!hasUnsavedChanges || isSaving}
                className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={() => void handleSaveChanges()}
                disabled={!hasUnsavedChanges || isSaving}
                className="rounded-lg bg-blue-600 px-5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Ukládám...' : 'Uložit'}
              </button>
            </div>
          </div>

          {/* Dialog A4: Odstranění skupiny */}
          {showDeleteNotice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center gap-3 text-red-600">
                  <AlertCircle className="h-6 w-6" />
                  <h3 className="text-base font-bold text-slate-900">Odstranění skupiny</h3>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                  Opravdu chcete odstranit skupinu{' '}
                  <strong className="text-slate-900">{name}</strong>? Tato akce je nevratná a
                  odstraní všechna data, členy a nastavení spojená se skupinou.
                </p>
                <div className="mt-5 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowDeleteNotice(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Zrušit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteNotice(false);
                      setIsGroupDeleted(true);
                    }}
                    className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
                  >
                    Odstranit skupinu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dialog A3: Odstranění člena skupiny */}
          {memberToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center gap-3 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  <h3 className="text-base font-bold text-slate-900">Odstranění člena</h3>
                </div>
                <p className="mt-3 text-xs text-slate-600">
                  Opravdu chcete odebrat člena{' '}
                  <strong className="text-slate-900">
                    {memberToDelete.name} {memberToDelete.surname}
                  </strong>{' '}
                  ze skupiny? Uživatel ztratí přístup k aktivitám a obsahu skupiny.
                </p>
                <div className="mt-5 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMemberToDelete(null)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Zrušit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
                      setSaveSuccessMsg(
                        `Člen ${memberToDelete.name} ${memberToDelete.surname} byl odebrán ze skupiny.`,
                      );
                      setTimeout(() => setSaveSuccessMsg(null), 3000);
                      setMemberToDelete(null);
                    }}
                    className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
                  >
                    Odstranit člena
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dialog: Pozvat člena do skupiny */}
          {isInviteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center gap-3 text-blue-600">
                  <UserPlus className="h-5 w-5" />
                  <h3 className="text-base font-bold text-slate-900">Pozvat člena do skupiny</h3>
                </div>
                <p className="mt-2.5 text-xs text-slate-600">
                  Sdílejte níže uvedený unikátní pozvánkový kód s novým členem. Pomocí tohoto kódu
                  se může připojit ke skupině.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={invitationCode}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center font-mono text-sm font-bold tracking-widest text-slate-900"
                  />
                  <Button
                    type="button"
                    onClick={handleCopyInvitationCode}
                    className="shrink-0 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedCode ? 'Zkopírováno' : 'Kopírovat kód'}</span>
                  </Button>
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Zavřít
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const MOCK_PREVIEW_SETTINGS: GroupSettingsResponse = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  name: 'Skupina 1',
  description: 'Sdílený prostor pro plánování aktivit, záznamy a spolupráci členů skupiny.',
  category: 'Obecná',
  color: 'blue-sky',
  logo: 'users',
  visibility: 'private',
  invitationCode: 'A7F3D9',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  owner: {
    id: 'user-georgii-id',
    name: 'Georgii',
    surname: 'Skvortcov',
    email: 'georgii@unicorn.cz',
  },
  membersCount: 3,
  currentUserRole: 'owner',
  permissions: {
    canEdit: true,
    canDelete: true,
    canManageMembers: true,
    canLeaveGroup: false,
  },
};

export function GroupSettingsPage({ groupId }: GroupSettingsPageProps) {
  const isDirectPreview = groupId === 'preview';
  const [showPreview, setShowPreview] = useState(isDirectPreview);
  const { settings, isLoading, error, refetch, updateSettings } = useGroupSettings(groupId);

  if (showPreview) {
    return (
      <GroupSettingsForm
        key="preview"
        settings={MOCK_PREVIEW_SETTINGS}
        updateSettings={async (body) => {
          return {
            ...MOCK_PREVIEW_SETTINGS,
            ...body,
            name: body.name ?? MOCK_PREVIEW_SETTINGS.name,
            description:
              body.description !== undefined ? body.description : MOCK_PREVIEW_SETTINGS.description,
            category: body.category !== undefined ? body.category : MOCK_PREVIEW_SETTINGS.category,
            logo: body.logo !== undefined ? body.logo : MOCK_PREVIEW_SETTINGS.logo,
            color: body.color !== undefined ? body.color : MOCK_PREVIEW_SETTINGS.color,
            invitationCode: body.invitationCode ?? MOCK_PREVIEW_SETTINGS.invitationCode,
          };
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-7 w-52 animate-pulse rounded-md bg-slate-200" />
            <div className="h-4 w-36 animate-pulse rounded-md bg-slate-200" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  // A2: Odepření přístupu nečlenům skupiny (403 Forbidden z backendu)
  if (
    error &&
    (error.includes('oprávnění') || error.includes('403') || error.includes('Forbidden'))
  ) {
    return (
      <div className="mx-auto max-w-2xl p-6 pt-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Přístup k nastavení skupiny odepřen</h1>
        <p className="mt-2 text-sm text-slate-600">
          K zobrazení nastavení této skupiny nemáte dostatečná oprávnění. Stránka je přístupná pouze
          členům skupiny a administrátorům.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button variant="outline" className="border-slate-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpět na přehled
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // A3: Chyba načítání (404, chyba spojení nebo nepřihlášený uživatel)
  if (error || !settings) {
    const isFetchError = error?.includes('fetch') || error?.includes('Failed');
    const isAuthError = error?.includes('authenticated') || error?.includes('401');

    return (
      <div className="mx-auto max-w-2xl p-6 pt-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Skupinu se nepodařilo načíst</h1>
        <p className="mt-2 text-sm text-slate-600">
          {isFetchError
            ? 'Backend API na portu 3001 není dostupné (Failed to fetch). Pro zobrazení grafického návrhu můžete přepnout do režimu náhledu.'
            : isAuthError
              ? 'Pro přístup k serverovým datům skupiny je vyžadováno přihlášení. Můžete si ale prohlédnout stránku v režimu náhledu.'
              : (error ?? 'Skupina nebyla nalezena.')}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/">
            <Button variant="outline" className="border-slate-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpět na přehled
            </Button>
          </Link>
          <Button onClick={() => void refetch()} variant="outline" className="border-slate-200">
            <RefreshCw className="mr-2 h-4 w-4" />
            Zkusit znovu
          </Button>
          <Button
            onClick={() => setShowPreview(true)}
            className="bg-blue-600 font-medium text-white shadow-xs hover:bg-blue-700"
          >
            Zobrazit náhled designu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <GroupSettingsForm key={settings.id} settings={settings} updateSettings={updateSettings} />
  );
}

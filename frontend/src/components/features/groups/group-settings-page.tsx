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
  Save,
  RotateCcw,
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
} from 'lucide-react';
import { useGroupSettings } from '@/hooks/use-group-settings';
import { fetchGroupMembers } from '@/lib/api/groups';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    previewClass: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600',
  },
  {
    id: 'sunset',
    name: 'Západ slunce',
    previewClass: 'bg-gradient-to-br from-amber-400 via-rose-500 to-pink-600',
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
    previewClass: 'bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300',
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
  const [description, setDescription] = useState(settings.description ?? '');
  const [selectedLogo, setSelectedLogo] = useState(settings.logo ?? 'users');
  const [selectedCategory, setSelectedCategory] = useState(settings.category ?? 'Obecná');
  const [selectedColor, setSelectedColor] = useState(settings.color ?? 'blue-sky');
  const [isChoosingLogo, setIsChoosingLogo] = useState(false);
  const [isChoosingBackground, setIsChoosingBackground] = useState(false);

  const [members, setMembers] = useState<GroupMemberResponse[]>([]);
  const [totalMembers, setTotalMembers] = useState(settings.membersCount);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Pozvánkový kód z API nebo deterministicky odvozený
  const invitationCode =
    settings.invitationCode ?? settings.id.replace(/-/g, '').slice(0, 6).toUpperCase();

  // Načtení skutečných členů ze serverového endpointu
  useEffect(() => {
    let active = true;
    async function loadMembers() {
      try {
        setIsLoadingMembers(true);
        const result = await fetchGroupMembers(settings.id);
        if (active) {
          setMembers(result.items);
          setTotalMembers(result.pageInfo.total);
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

  const hasUnsavedChanges = Object.keys(diffPayload).length > 0;

  // A1: Zrušení provedených změn (reset do baseline)
  function handleResetChanges() {
    setName(baseline.name);
    setDescription(baseline.description ?? '');
    setSelectedLogo(baseline.logo ?? 'users');
    setSelectedCategory(baseline.category ?? 'Obecná');
    setSelectedColor(baseline.color ?? 'blue-sky');
    setSaveError(null);
    setSaveSuccessMsg(null);
    setIsChoosingLogo(false);
    setIsChoosingBackground(false);
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
        setDescription(updated.description ?? '');
        setSelectedLogo(updated.logo ?? 'users');
        setSelectedCategory(updated.category ?? 'Obecná');
        setSelectedColor(updated.color ?? 'blue-sky');

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

  return (
    <div className="flex min-h-screen bg-slate-50/60">
      {/* Postranní navigace (Sidebar) podle předlohy */}
      <aside className="hidden w-60 shrink-0 border-r border-slate-200/80 bg-white p-5 md:block">
        <div className="mb-6 px-3">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
              TT
            </div>
            <span>Time Tracker</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Přehled</span>
          </Link>
          <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-3.5 py-2.5 text-sm font-semibold text-blue-600">
            <Users className="h-4 w-4" />
            <span>Skupiny</span>
          </div>
          <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400">
            <LayoutGrid className="h-4 w-4" />
            <span>Kategorie</span>
          </div>
          <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400">
            <Tag className="h-4 w-4" />
            <span>Tagy</span>
          </div>
        </nav>
      </aside>

      {/* Hlavní obsahová část */}
      <main className="flex-1 p-6 md:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Záhlaví stránky */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Nastavení skupiny
              </h1>
              <p className="text-sm text-slate-500">
                Správa základních informací, členů a vizuálního motivu skupiny {baseline.name}
              </p>
            </div>
            {!canEdit && (
              <Badge
                variant="outline"
                className="w-fit border-amber-300 bg-amber-50 text-amber-800"
              >
                Režim čtení (pouze pro čtení)
              </Badge>
            )}
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
          <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base font-semibold text-slate-900">
                  Základní informace
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[140px_1fr]">
                {/* Logo a tlačítko změnit */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm ring-4 ring-blue-50">
                    <CurrentLogoIcon className="h-12 w-12" />
                  </div>
                  {canEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChoosingLogo((prev) => !prev)}
                      className="h-8 gap-1.5 border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Camera className="h-3.5 w-3.5 text-slate-500" />
                      Změnit logo
                    </Button>
                  )}

                  {/* Volba ikony loga při rozkliknutí */}
                  {isChoosingLogo && canEdit && (
                    <div className="w-full rounded-xl border border-slate-200 bg-white p-2.5 shadow-md">
                      <div className="grid grid-cols-3 gap-2">
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
                              className={`flex flex-col items-center justify-center rounded-lg p-2 transition-all ${
                                isSelected
                                  ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                              title={item.label}
                            >
                              <IconComp className="h-5 w-5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Formulářová pole základních informací */}
                <div className="space-y-4">
                  {/* Název skupiny */}
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[150px_1fr] sm:items-center">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Pencil className="h-4 w-4 text-slate-400" />
                      <span>Název skupiny</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!canEdit}
                      maxLength={100}
                      placeholder="Zadejte název skupiny"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>

                  {/* Popis skupiny */}
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[150px_1fr] sm:items-start">
                    <label className="flex items-center gap-2 pt-2 text-sm font-medium text-slate-700">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span>Popis skupiny</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={!canEdit}
                      rows={2}
                      maxLength={500}
                      placeholder="Sdílený prostor pro plánování aktivit, záznamy a spolupráci členů skupiny."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>

                  {/* Vlastník skupiny (read-only) */}
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[150px_1fr] sm:items-center">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>Vlastník skupiny</span>
                    </label>
                    <div className="flex h-9.5 items-center rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-700">
                      {settings.owner ? (
                        <span>
                          {settings.owner.name} {settings.owner.surname}
                          {settings.owner.email && (
                            <span className="ml-2 text-xs text-slate-400">
                              ({settings.owner.email})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          Skupina nemá určeného vlastníka
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pozvánkový kód */}
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-[150px_1fr] sm:items-center">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <LinkIcon className="h-4 w-4 text-slate-400" />
                      <span>Pozvánkový kód</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        readOnly
                        value={invitationCode}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 pr-11 font-mono text-sm tracking-wider text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleCopyInvitationCode}
                        className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/80 hover:text-slate-900"
                        title="Zkopírovat pozvánkový kód"
                      >
                        {copiedCode ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DVOJSLOUPEC 1: Kategorie & Role */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* KARTA 2: Kategorie skupiny */}
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-500" />
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Kategorie skupiny
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  Vyberte kategorii, která nejlépe vystihuje zaměření skupiny.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                        {IconComp && !isSelected && (
                          <IconComp className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* KARTA 3: Role a oprávnění */}
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Role a oprávnění
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  Nastavte role ve skupině a jejich oprávnění.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="pb-2 font-medium">Role</th>
                        <th className="pb-2 font-medium">Popis a hlavní oprávnění</th>
                        <th className="pb-2 text-center font-medium">Může přiřazovat role</th>
                        <th className="pb-2 text-center font-medium">Může odstraňovat členy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="flex items-center gap-1 py-2.5 font-semibold text-slate-900">
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                          <span>Vlastník</span>
                        </td>
                        <td className="py-2.5 text-slate-500">
                          Plná správa skupiny, všechny oprávnění.
                        </td>
                        <td className="py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked
                            disabled
                            className="h-4 w-4 rounded accent-blue-600"
                          />
                        </td>
                        <td className="py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked
                            disabled
                            className="h-4 w-4 rounded accent-blue-600"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="flex items-center gap-1 py-2.5 font-semibold text-slate-900">
                          <Shield className="h-3.5 w-3.5 text-blue-500" />
                          <span>Administrátor</span>
                        </td>
                        <td className="py-2.5 text-slate-500">Správa členů a obsahu skupiny.</td>
                        <td className="py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked
                            disabled
                            className="h-4 w-4 rounded accent-blue-600"
                          />
                        </td>
                        <td className="py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked
                            disabled
                            className="h-4 w-4 rounded accent-blue-600"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="flex items-center gap-1 py-2.5 font-medium text-slate-800">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>Člen</span>
                        </td>
                        <td className="py-2.5 text-slate-500">
                          Základní přístup k aktivitám a obsahu.
                        </td>
                        <td className="py-2.5 text-center">
                          <input type="checkbox" disabled className="h-4 w-4 rounded" />
                        </td>
                        <td className="py-2.5 text-center">
                          <input type="checkbox" disabled className="h-4 w-4 rounded" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* DVOJSLOUPEC 2: Členové skupiny & Pozadí skupiny */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* KARTA 4: Členové skupiny */}
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Členové skupiny
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-slate-500">
                    Spravujte členy skupiny a jejich role.
                  </CardDescription>
                </div>
                {canEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyInvitationCode}
                    className="h-8 gap-1.5 border-slate-200 text-xs font-medium text-blue-600 hover:bg-blue-50"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Pozvat člena
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingMembers ? (
                  <div className="space-y-2 py-2">
                    <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                  </div>
                ) : membersError ? (
                  <p className="text-xs text-red-600">{membersError}</p>
                ) : members.length === 0 ? (
                  <p className="text-xs text-slate-500">Ve skupině nejsou žádní další členové.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {members.map((member) => {
                      const isOwner = member.role === 'owner';
                      const initials = `${member.name?.[0] ?? ''}${member.surname?.[0] ?? ''}`;
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                                <span>
                                  {member.name} {member.surname}
                                </span>
                                {isOwner && <Crown className="h-3 w-3 text-amber-500" />}
                              </div>
                              <span className="text-xs text-slate-400 capitalize">
                                {isOwner ? 'Vlastník' : 'Člen'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                isOwner
                                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                                  : 'border-slate-200 bg-slate-50 text-slate-600'
                              }`}
                            >
                              {isOwner ? 'Vlastník' : 'Člen'}
                            </Badge>
                            {!isOwner && canEdit && (
                              <button
                                type="button"
                                disabled
                                className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-lg text-slate-300"
                                title="Správa členů probíhá v detailu členů skupiny"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {totalMembers > members.length && (
                  <p className="pt-2 text-center text-xs text-slate-400">
                    Zobrazeno prvních {members.length} z celkem {totalMembers} členů skupiny.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* KARTA 5: Pozadí skupiny */}
            <Card className="rounded-2xl border-slate-200/80 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Pozadí skupiny
                  </CardTitle>
                </div>
                <CardDescription className="text-xs text-slate-500">
                  Vyberte vizuální motiv, který se bude zobrazovat v rámci skupiny.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {BACKGROUND_THEMES.map((theme) => {
                    const isSelected = selectedColor === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setSelectedColor(theme.id)}
                        className={`relative h-14 w-full rounded-xl transition-all ${theme.previewClass} ${
                          isSelected
                            ? 'ring-2 ring-blue-500 ring-offset-2'
                            : 'opacity-80 hover:opacity-100'
                        } disabled:cursor-not-allowed`}
                        title={theme.name}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm">
                            <Check className="h-2.5 w-2.5 stroke-[3] text-blue-600" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {canEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChoosingBackground((prev) => !prev)}
                    className="h-8 gap-1.5 border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                    Změnit pozadí
                  </Button>
                )}

                {isChoosingBackground && canEdit && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-500">
                    Kliknutím na kteroukoli miniaturu výše vyberete barevný vizuální motiv pro tuto
                    skupinu.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* SPODNÍ AKČNÍ LIŠTA */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetChanges}
              disabled={!hasUnsavedChanges || isSaving}
              className="h-10 rounded-xl border-slate-200 px-5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Zrušit
            </Button>
            <Button
              type="button"
              onClick={() => void handleSaveChanges()}
              disabled={!hasUnsavedChanges || isSaving}
              className="h-10 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="mr-1.5 h-4 w-4" />
              {isSaving ? 'Ukládám...' : 'Uložit'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export function GroupSettingsPage({ groupId }: GroupSettingsPageProps) {
  const { settings, isLoading, error, refetch, updateSettings } = useGroupSettings(groupId);

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

  // A3: Chyba načítání (404 nebo chyba spojení)
  if (error || !settings) {
    return (
      <div className="mx-auto max-w-2xl p-6 pt-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Skupinu se nepodařilo načíst</h1>
        <p className="mt-2 text-sm text-slate-600">{error ?? 'Skupina nebyla nalezena.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/">
            <Button variant="outline" className="border-slate-200">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpět na přehled
            </Button>
          </Link>
          <Button onClick={() => void refetch()} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="mr-2 h-4 w-4" />
            Zkusit znovu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <GroupSettingsForm key={settings.id} settings={settings} updateSettings={updateSettings} />
  );
}

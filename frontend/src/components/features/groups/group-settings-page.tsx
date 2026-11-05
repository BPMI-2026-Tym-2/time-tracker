'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { GroupSettingsResponse, UpdateGroupSettingsBody } from '@time-tracker/shared';
import {
  Users,
  Settings,
  Copy,
  Check,
  Calendar,
  Shield,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Palette,
  Tag,
  UserPlus,
  Plus,
  Trash2,
  Lock,
  Globe,
  Rocket,
  Code,
  Flame,
  Zap,
  Target,
  Star,
  Folder,
  Save,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { useGroupSettings } from '@/hooks/use-group-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type GroupSettingsPageProps = {
  groupId: string;
};

const LOGO_PRESETS = [
  { id: 'rocket', label: 'Raketa', icon: Rocket },
  { id: 'code', label: 'Kód', icon: Code },
  { id: 'users', label: 'Tým', icon: Users },
  { id: 'flame', label: 'Oheň', icon: Flame },
  { id: 'zap', label: 'Blesk', icon: Zap },
  { id: 'target', label: 'Cíl', icon: Target },
  { id: 'globe', label: 'Svět', icon: Globe },
  { id: 'star', label: 'Hvězda', icon: Star },
  { id: 'folder', label: 'Projekt', icon: Folder },
] as const;

const COLOR_THEMES = [
  {
    id: 'blue',
    name: 'Královská modrá',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    dot: 'bg-blue-600',
    activeRing: 'ring-blue-600',
  },
  {
    id: 'sky',
    name: 'Blankytně modrá',
    bg: 'bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/30',
    dot: 'bg-sky-500',
    activeRing: 'ring-sky-500',
  },
  {
    id: 'navy',
    name: 'Námořnická modrá',
    bg: 'bg-blue-900/10',
    text: 'text-blue-900 dark:text-blue-300',
    border: 'border-blue-900/30',
    dot: 'bg-blue-900',
    activeRing: 'ring-blue-900',
  },
  {
    id: 'cyan',
    name: 'Ledově modrá / Cyan',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-500',
    activeRing: 'ring-cyan-500',
  },
  {
    id: 'indigo',
    name: 'Hluboká modř / Indigo',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-600',
    activeRing: 'ring-indigo-600',
  },
] as const;

const DEFAULT_CATEGORIES = [
  'Vývoj aplikací',
  'UI/UX Design',
  'Marketing',
  'Projektový management',
  'Výzkum & Analytika',
  'Produktový tým',
  'Obecné',
];

function GroupSettingsForm({
  settings,
  updateSettings,
}: {
  settings: GroupSettingsResponse;
  updateSettings: (body: UpdateGroupSettingsBody) => Promise<boolean>;
}) {
  const [name, setName] = useState(settings.name);
  const [description, setDescription] = useState(settings.description ?? '');
  const [visibility, setVisibility] = useState<'private' | 'public'>(
    settings.visibility ?? 'private',
  );
  const [selectedLogo, setSelectedLogo] = useState(settings.logo ?? 'rocket');
  const [selectedColor, setSelectedColor] = useState(settings.color ?? 'indigo');
  const [selectedCategory, setSelectedCategory] = useState(settings.category ?? 'Vývoj aplikací');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [copiedId, setCopiedId] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'member' | 'owner'>('member');
  const [membersList, setMembersList] = useState<
    Array<{ id: string; name: string; email: string; role: 'member' | 'owner'; isOwner?: boolean }>
  >([
    {
      id: settings.owner.id,
      name: `${settings.owner.name} ${settings.owner.surname}`,
      email: settings.owner.email ?? 'vlastnik@unicorn.cz',
      role: 'owner',
      isOwner: true,
    },
  ]);

  const hasUnsavedChanges =
    name !== settings.name ||
    description !== (settings.description ?? '') ||
    visibility !== (settings.visibility ?? 'private') ||
    selectedLogo !== (settings.logo ?? 'rocket') ||
    selectedColor !== (settings.color ?? 'indigo') ||
    selectedCategory !== (settings.category ?? 'Vývoj aplikací');

  const handleCopyGroupId = async () => {
    if (!settings.id) return;
    try {
      await navigator.clipboard.writeText(settings.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // noop
    }
  };

  const handleResetChanges = () => {
    setName(settings.name);
    setDescription(settings.description ?? '');
    setVisibility(settings.visibility ?? 'private');
    setSelectedLogo(settings.logo ?? 'rocket');
    setSelectedColor(settings.color ?? 'indigo');
    setSelectedCategory(settings.category ?? 'Vývoj aplikací');
    setSaveError(null);
    triggerNotification('Změny byly zrušeny a původní nastavení obnoveno');
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const ok = await updateSettings({
        name,
        description,
        visibility,
        logo: selectedLogo,
        color: selectedColor,
        category: selectedCategory,
      });

      if (!ok) {
        throw new Error('Systém nedokázal uložit provedené změny');
      }

      triggerNotification('Nastavení skupiny bylo úspěšně uloženo');
    } catch {
      setSaveError('Nastala chyba při ukládání změn. Zkuste to prosím znovu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories((prev) => [...prev, trimmed]);
    setSelectedCategory(trimmed);
    setNewCategoryName('');
    triggerNotification(`Kategorie „${trimmed}“ byla přidána`);
  };

  const handleRemoveCategory = (cat: string) => {
    if (categories.length <= 1) return;
    setCategories((prev) => prev.filter((c) => c !== cat));
    if (selectedCategory === cat) {
      const remaining = categories.filter((c) => c !== cat);
      setSelectedCategory(remaining[0] ?? 'Obecné');
    }
    triggerNotification(`Kategorie „${cat}“ byla odebrána`);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    const emailName = newMemberEmail.split('@')[0] ?? 'Uživatel';
    const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

    const newMember = {
      id: `usr_${membersList.length + 1}`,
      name: capitalizedName,
      email: newMemberEmail.trim(),
      role: newMemberRole,
    };

    setMembersList((prev) => [...prev, newMember]);
    setNewMemberEmail('');
    setIsAddMemberOpen(false);
    triggerNotification(`Uživatel ${newMember.email} byl přidán do skupiny`);
  };

  const handleRemoveMember = (memberId: string, memberEmail: string) => {
    setMembersList((prev) => prev.filter((m) => m.id !== memberId));
    triggerNotification(`Uživatel ${memberEmail} byl odebrán ze skupiny`);
  };

  const triggerNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3500);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const currentTheme = COLOR_THEMES.find((t) => t.id === selectedColor) ?? COLOR_THEMES[0]!;
  const currentLogoPreset = LOGO_PRESETS.find((l) => l.id === selectedLogo) ?? LOGO_PRESETS[0]!;
  const LogoIcon = currentLogoPreset.icon;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 pb-24">
      {saveSuccessMsg && (
        <div className="animate-in fade-in slide-in-from-top-3 fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg dark:bg-emerald-950 dark:text-emerald-200">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveError && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-between rounded-xl border p-4 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{saveError}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void handleSaveChanges()}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            Zkusit znovu
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Link href="/" className="hover:text-foreground transition-colors">
              Skupiny
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{settings.name}</span>
            <span>/</span>
            <span>Nastavení</span>
          </div>
          <div className="mt-3 flex items-center gap-3.5">
            <div
              className={`flex h-13 w-13 items-center justify-center rounded-2xl border ${currentTheme.border} ${currentTheme.bg} ${currentTheme.text} shadow-xs transition-all`}
            >
              <LogoIcon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-foreground text-2xl font-bold tracking-tight">
                  {name || settings.name}
                </h1>
                <Badge
                  variant="outline"
                  className={`gap-1 border ${currentTheme.border} ${currentTheme.text}`}
                >
                  <Tag className="h-3 w-3" />
                  {selectedCategory}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Správa, vizuální styl a členové skupiny
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1.5 px-3 py-1">
            <Shield className="h-3.5 w-3.5" />
            Vlastník skupiny
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className={`h-5 w-5 ${currentTheme.text}`} />
            Základní informace a viditelnost
          </CardTitle>
          <CardDescription>
            Nastavte název skupiny a určete, kdo k ní může mít přístup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Název skupiny
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-border bg-background focus:ring-primary/30 mt-1.5 w-full rounded-xl border px-3 py-2 text-sm font-medium focus:ring-2 focus:outline-none"
                placeholder="Zadejte název skupiny..."
              />
            </div>

            <div>
              <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Viditelnost skupiny
              </label>
              <div className="mt-1.5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border p-2 text-xs font-medium transition-all ${
                    visibility === 'private'
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'border-border/70 hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  Soukromá
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border p-2 text-xs font-medium transition-all ${
                    visibility === 'public'
                      ? 'border-primary bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'border-border/70 hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Veřejná
                </button>
              </div>
            </div>
          </div>

          <div className="border-border/60 border-t pt-4">
            <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Popisek skupiny
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-border bg-background focus:ring-primary/30 mt-1.5 w-full rounded-xl border p-3 text-sm focus:ring-2 focus:outline-none"
              placeholder="Popište hlavní účel nebo zaměření skupiny..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LogoIcon className={`h-5 w-5 ${currentTheme.text}`} />
              Logo a ikona skupiny
            </CardTitle>
            <CardDescription>
              Zvolte reprezentativní symbol pro identifikaci skupiny.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2.5">
              {LOGO_PRESETS.map((preset) => {
                const IconComp = preset.icon;
                const isSelected = selectedLogo === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedLogo(preset.id)}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                      isSelected
                        ? `${currentTheme.bg} ${currentTheme.border} ${currentTheme.text} ring-primary/20 font-semibold shadow-xs ring-2`
                        : 'border-border/70 hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                    <span>{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className={`h-5 w-5 ${currentTheme.text}`} />
              Barevná tematika skupiny
            </CardTitle>
            <CardDescription>Barevný styl ovlivňující grafické prvky skupiny.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {COLOR_THEMES.map((theme) => {
                const isSelected = selectedColor === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedColor(theme.id)}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                      isSelected
                        ? `${theme.bg} ${theme.border} ${theme.text} ring-2 ring-offset-1 ${theme.activeRing} font-semibold shadow-xs`
                        : 'border-border/70 hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <span className={`h-3.5 w-3.5 rounded-full ${theme.dot} shrink-0`} />
                    <span className="truncate">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className={`h-5 w-5 ${currentTheme.text}`} />
            Kategorie skupiny
          </CardTitle>
          <CardDescription>
            Přidejte nebo odeberte kategorie a zařaďte skupinu do příslušného oboru.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <div
                  key={cat}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? `${currentTheme.bg} ${currentTheme.border} ${currentTheme.text} font-semibold shadow-xs`
                      : 'border-border/70 text-muted-foreground'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className="cursor-pointer"
                  >
                    {cat}
                  </button>
                  {categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-muted-foreground hover:text-destructive ml-0.5 cursor-pointer"
                      title="Odebrat kategorii"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-border/60 flex gap-2 border-t pt-3">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Název nové kategorie..."
              className="border-border bg-background focus:ring-primary/30 h-8 max-w-xs rounded-lg border px-3 text-xs focus:ring-2 focus:outline-none"
            />
            <Button size="sm" variant="outline" onClick={handleAddCategory} className="h-8 gap-1">
              <Plus className="h-3.5 w-3.5" />
              Přidat kategorii
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className={`h-5 w-5 ${currentTheme.text}`} />
              Správa členů a uživatelské role
            </CardTitle>
            <CardDescription>
              Přidejte nové členy nebo odeberte stávající uživatele ze skupiny.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-2.5 py-1 text-xs font-semibold">
              {membersList.length}{' '}
              {membersList.length === 1 ? 'člen' : membersList.length < 5 ? 'členové' : 'členů'}
            </Badge>
            <Button
              size="sm"
              onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
              className="gap-1.5"
            >
              <UserPlus className="h-4 w-4" />+ Do skupiny
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {isAddMemberOpen && (
            <form
              onSubmit={handleAddMember}
              className="bg-muted/40 border-border/80 animate-in fade-in space-y-3.5 rounded-2xl border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                  <UserPlus className="text-primary h-4 w-4" />
                  Přidat nového uživatele do skupiny
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
                >
                  ×
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="text-muted-foreground text-xs font-medium">
                    E-mail uživatele
                  </label>
                  <input
                    type="email"
                    required
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="novy.clen@unicorn.cz"
                    className="border-border bg-background focus:ring-primary/30 mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground text-xs font-medium">
                    Role ve skupině
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as 'member' | 'owner')}
                    className="border-border bg-background focus:ring-primary/30 mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                  >
                    <option value="member">Člen (member)</option>
                    <option value="owner">Správce / Vlastník (owner)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddMemberOpen(false)}
                >
                  Zrušit
                </Button>
                <Button type="submit" size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Přidat do skupiny
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2.5">
            {membersList.map((m) => (
              <div
                key={m.id}
                className="border-border/60 bg-card flex items-center justify-between rounded-xl border p-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-foreground text-sm font-semibold">{m.name}</div>
                    <div className="text-muted-foreground text-xs">{m.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Badge variant={m.role === 'owner' ? 'default' : 'secondary'} className="text-xs">
                    {m.role === 'owner' ? 'Vlastník' : 'Člen'}
                  </Badge>

                  {!m.isOwner && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMember(m.id, m.email)}
                      className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                      title="Odebrat uživatele ze skupiny"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="text-muted-foreground h-5 w-5" />
            Systémové informace
          </CardTitle>
          <CardDescription>Technické identifikátory a auditní data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5 text-xs">
          <div>
            <span className="text-muted-foreground font-medium tracking-wider uppercase">
              ID skupiny
            </span>
            <div className="bg-muted/50 border-border/60 mt-1 flex items-center justify-between rounded-lg border p-2 font-mono text-xs">
              <span className="truncate pr-2">{settings.id}</span>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => void handleCopyGroupId()}
                className="h-7 gap-1"
              >
                {copiedId ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-600">Zkopírováno</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Kopírovat</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="border-border/60 grid grid-cols-2 gap-3 border-t pt-3">
            <div>
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Vytvořeno
              </span>
              <div className="text-foreground mt-1 font-medium">
                {formatDate(settings.createdAt)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Poslední změna
              </span>
              <div className="text-foreground mt-1 font-medium">
                {formatDate(settings.updatedAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-border/80 bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="text-muted-foreground text-xs">
            {hasUnsavedChanges ? (
              <span className="font-medium text-amber-600 dark:text-amber-400">
                Máte neuložené změny v nastavení skupiny.
              </span>
            ) : (
              <span>Všechny změny jsou uloženy.</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChanges}
              disabled={!hasUnsavedChanges || isSaving}
              className="gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              Zrušit
            </Button>
            <Button
              size="sm"
              onClick={() => void handleSaveChanges()}
              disabled={isSaving}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Ukládám...' : 'Uložit'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GroupSettingsPage({ groupId }: GroupSettingsPageProps) {
  const { settings, isLoading, error, refetch, updateSettings } = useGroupSettings(groupId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="bg-muted h-12 w-12 animate-pulse rounded-2xl" />
          <div className="space-y-2">
            <div className="bg-muted h-7 w-52 animate-pulse rounded-md" />
            <div className="bg-muted h-4 w-36 animate-pulse rounded-md" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card border-border/80 h-52 animate-pulse rounded-2xl border" />
          <div className="bg-card border-border/80 h-52 animate-pulse rounded-2xl border" />
        </div>
      </div>
    );
  }

  if (settings && settings.currentUserRole !== 'owner') {
    return (
      <div className="mx-auto max-w-2xl p-6 pt-16 text-center">
        <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-foreground text-2xl font-bold">Přístup k nastavení skupiny odepřen</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          K zobrazení a úpravě nastavení této skupiny má oprávnění pouze její vlastník.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpět na přehled skupin
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="mx-auto max-w-2xl p-6 pt-16 text-center">
        <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-foreground text-2xl font-bold">Skupinu se nepodařilo načíst</h1>
        <p className="text-muted-foreground mt-2 text-sm">{error ?? 'Skupina nebyla nalezena.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpět na přehled
            </Button>
          </Link>
          <Button onClick={() => void refetch()}>
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

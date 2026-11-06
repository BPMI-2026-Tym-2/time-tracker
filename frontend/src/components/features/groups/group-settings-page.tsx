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
  Calendar,
  Shield,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Palette,
  Tag,
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
  Info,
} from 'lucide-react';
import { useGroupSettings } from '@/hooks/use-group-settings';
import { fetchGroupMembers } from '@/lib/api/groups';
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

const POPULAR_CATEGORIES = [
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
  const canEdit = settings.permissions.canEdit;

  const [name, setName] = useState(settings.name);
  const [description, setDescription] = useState(settings.description ?? '');
  const [visibility, setVisibility] = useState<'private' | 'public'>(
    settings.visibility ?? 'private',
  );
  const [selectedLogo, setSelectedLogo] = useState(settings.logo ?? 'rocket');
  const [selectedColor, setSelectedColor] = useState(settings.color ?? 'blue');
  const [selectedCategory, setSelectedCategory] = useState(settings.category ?? 'Vývoj aplikací');

  const [members, setMembers] = useState<GroupMemberResponse[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

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

  const hasUnsavedChanges =
    name !== settings.name ||
    description !== (settings.description ?? '') ||
    visibility !== (settings.visibility ?? 'private') ||
    selectedLogo !== (settings.logo ?? 'rocket') ||
    selectedColor !== (settings.color ?? 'blue') ||
    selectedCategory !== (settings.category ?? 'Vývoj aplikací');

  const handleCopyGroupId = async () => {
    if (!settings.id) return;
    try {
      await navigator.clipboard.writeText(settings.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // ignorovat chybu schránky
    }
  };

  const triggerNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3500);
  };

  const handleResetChanges = () => {
    setName(settings.name);
    setDescription(settings.description ?? '');
    setVisibility(settings.visibility ?? 'private');
    setSelectedLogo(settings.logo ?? 'rocket');
    setSelectedColor(settings.color ?? 'blue');
    setSelectedCategory(settings.category ?? 'Vývoj aplikací');
    setSaveError(null);
    triggerNotification('Změny byly zrušeny a původní nastavení obnoveno');
  };

  const handleSaveChanges = async () => {
    if (!canEdit) return;
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

  const currentTheme = COLOR_THEMES.find((theme) => theme.id === selectedColor) ?? COLOR_THEMES[0];
  const activeLogoItem =
    LOGO_PRESETS.find((preset) => preset.id === selectedLogo) ?? LOGO_PRESETS[0];
  const LogoIcon = activeLogoItem.icon;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 pb-28 md:p-8">
      {/* Informační pruh pro režim čtení */}
      {!canEdit && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-200">
          <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <div className="font-semibold">Režim pouze pro čtení</div>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              Prohlížíte nastavení skupiny jako člen. Úpravy nastavení může provádět pouze vlastník
              skupiny nebo administrátor.
            </div>
          </div>
        </div>
      )}

      {/* Oznámení o úspěchu */}
      {saveSuccessMsg && (
        <div className="animate-in fade-in slide-in-from-top-4 fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <Check className="h-4 w-4" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* A3: Chybové hlášení při ukládání */}
      {saveError && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start justify-between gap-3 rounded-2xl border p-4 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <div className="font-semibold">Chyba při ukládání nastavení</div>
              <div className="text-xs opacity-90">{saveError}</div>
            </div>
          </div>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleSaveChanges()}
              className="border-destructive/30 hover:bg-destructive/10 text-destructive shrink-0 text-xs"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Zkusit znovu
            </Button>
          )}
        </div>
      )}

      {/* Záhlaví stránky */}
      <div className="border-border/70 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${currentTheme.bg} ${currentTheme.border} ${currentTheme.text} shadow-xs transition-colors`}
          >
            <LogoIcon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
                {name || 'Bez názvu'}
              </h1>
              <Badge
                variant={visibility === 'private' ? 'secondary' : 'default'}
                className="text-xs"
              >
                {visibility === 'private' ? (
                  <>
                    <Lock className="mr-1 h-3 w-3" /> Soukromá
                  </>
                ) : (
                  <>
                    <Globe className="mr-1 h-3 w-3" /> Veřejná
                  </>
                )}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {description || 'Skupina nemá zadaný popisek.'}
            </p>
          </div>
        </div>

        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Calendar className="h-4 w-4" />
          <span>Vytvořeno {formatDate(settings.createdAt)}</span>
        </div>
      </div>

      {/* Karty nastavení */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Základní informace */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Základní údaje skupiny</CardTitle>
            <CardDescription>Upravte název a veřejný popis pro členy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="group-name" className="text-foreground text-xs font-semibold">
                Název skupiny
              </label>
              <input
                id="group-name"
                type="text"
                value={name}
                disabled={!canEdit}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="border-border bg-background text-foreground disabled:bg-muted/40 mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="group-desc" className="text-foreground text-xs font-semibold">
                Popisek skupiny
              </label>
              <textarea
                id="group-desc"
                rows={3}
                value={description}
                disabled={!canEdit}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="border-border bg-background text-foreground disabled:bg-muted/40 mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <span className="text-foreground text-xs font-semibold">Viditelnost skupiny</span>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => setVisibility('private')}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all disabled:cursor-not-allowed ${
                    visibility === 'private'
                      ? 'border-blue-600 bg-blue-50/70 font-semibold text-blue-700 shadow-xs ring-1 ring-blue-600/30 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'border-border/70 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  Soukromá
                </button>
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => setVisibility('public')}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all disabled:cursor-not-allowed ${
                    visibility === 'public'
                      ? 'border-blue-600 bg-blue-50/70 font-semibold text-blue-700 shadow-xs ring-1 ring-blue-600/30 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'border-border/70 text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Veřejná
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vlastník a oprávnění */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Vlastník a oprávnění</CardTitle>
            <CardDescription>Správce skupiny a aktuální role volajícího.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="border-border/70 bg-muted/30 rounded-xl border p-3.5">
              <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Vlastník skupiny
              </div>
              {settings.owner ? (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                      {settings.owner.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-foreground font-semibold">
                        {settings.owner.name} {settings.owner.surname}
                      </div>
                      {settings.owner.email && (
                        <div className="text-muted-foreground text-xs">{settings.owner.email}</div>
                      )}
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs">
                    Vlastník
                  </Badge>
                </div>
              ) : (
                <div className="text-muted-foreground mt-2 text-xs italic">
                  Skupina nemá přiřazeného vlastníka
                </div>
              )}
            </div>

            <div className="border-border/70 bg-muted/30 rounded-xl border p-3.5">
              <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Vaše role ve skupině
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-foreground flex items-center gap-2 font-medium">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>
                    {settings.currentUserRole === 'owner'
                      ? 'Správce / Vlastník skupiny'
                      : settings.currentUserRole === 'member'
                        ? 'Řadový člen skupiny'
                        : 'Administrátor (mimo členství)'}
                  </span>
                </div>
                <Badge variant={canEdit ? 'default' : 'secondary'} className="text-xs">
                  {canEdit ? 'Plná práva ke správě' : 'Pouze pro čtení'}
                </Badge>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                ID skupiny
              </span>
              <div className="border-border/70 bg-muted/40 text-foreground mt-1.5 flex items-center justify-between rounded-xl border px-3 py-2 font-mono text-xs">
                <span className="truncate pr-2">{settings.id}</span>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => void handleCopyGroupId()}
                  className="h-7 gap-1 text-xs"
                >
                  {copiedId ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-blue-600">Zkopírováno</span>
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
          </CardContent>
        </Card>
      </div>

      {/* Logo a barevná tematika */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Výběr loga */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <LogoIcon className={`h-5 w-5 ${currentTheme.text}`} />
              Logo a ikona skupiny
            </CardTitle>
            <CardDescription>Zvolte symbol reprezentující zaměření skupiny.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2.5">
              {LOGO_PRESETS.map((preset) => {
                const IconComp = preset.icon;
                const isSelected = selectedLogo === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => setSelectedLogo(preset.id)}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all disabled:cursor-not-allowed ${
                      isSelected
                        ? `${currentTheme.bg} ${currentTheme.border} ${currentTheme.text} font-semibold shadow-xs ring-2 ring-blue-600/20`
                        : 'border-border/70 text-foreground hover:bg-muted/60'
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

        {/* Barevná tematika */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Palette className={`h-5 w-5 ${currentTheme.text}`} />
              Barevná tematika skupiny
            </CardTitle>
            <CardDescription>Výběr odstínu modré pro vizuální styl prvků.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {COLOR_THEMES.map((theme) => {
                const isSelected = selectedColor === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => setSelectedColor(theme.id)}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-xs font-medium transition-all disabled:cursor-not-allowed ${
                      isSelected
                        ? `${theme.bg} ${theme.border} ${theme.text} font-semibold shadow-xs ring-2 ring-offset-1 ${theme.activeRing}`
                        : 'border-border/70 text-foreground hover:bg-muted/50'
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

      {/* Kategorie skupiny */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Tag className={`h-5 w-5 ${currentTheme.text}`} />
            Kategorie skupiny
          </CardTitle>
          <CardDescription>
            Zvolte hlavní obor nebo zadejte vlastní kategorii skupiny.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {POPULAR_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-xs font-medium transition-all disabled:cursor-not-allowed ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 font-semibold text-white shadow-xs'
                      : 'border-border/70 text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div>
            <label htmlFor="custom-category" className="text-foreground text-xs font-semibold">
              Vlastní kategorie
            </label>
            <input
              id="custom-category"
              type="text"
              value={selectedCategory}
              disabled={!canEdit}
              onChange={(e) => setSelectedCategory(e.target.value)}
              placeholder="Zadejte název kategorie"
              maxLength={50}
              className="border-border bg-background text-foreground disabled:bg-muted/40 mt-1.5 w-full max-w-md rounded-xl border px-3.5 py-2 text-sm transition-all focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none disabled:cursor-not-allowed"
            />
          </div>
        </CardContent>
      </Card>

      {/* Skuteční členové skupiny ze serveru */}
      <Card className="border-border/70 shadow-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Users className={`h-5 w-5 ${currentTheme.text}`} />
            Členové skupiny
          </CardTitle>
          <CardDescription>
            Aktuální seznam uživatelů registrovaných v této skupině ({members.length}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMembers ? (
            <div className="space-y-3">
              <div className="bg-muted h-12 animate-pulse rounded-xl" />
              <div className="bg-muted h-12 animate-pulse rounded-xl" />
            </div>
          ) : membersError ? (
            <div className="text-destructive text-xs">{membersError}</div>
          ) : members.length === 0 ? (
            <div className="text-muted-foreground py-4 text-center text-xs">
              Skupina zatím nemá žádné registrované členy.
            </div>
          ) : (
            <div className="space-y-2.5">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="border-border/70 bg-card flex items-center justify-between rounded-xl border p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/10 font-semibold text-blue-700">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-foreground text-sm font-semibold">
                        {m.name} {m.surname}
                      </div>
                      {m.email && <div className="text-muted-foreground text-xs">{m.email}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground hidden text-xs sm:inline">
                      Připojen(a) {formatDate(m.joinedAt)}
                    </span>
                    <Badge
                      variant={m.role === 'owner' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {m.role === 'owner' ? 'Vlastník' : 'Člen'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spodní akční lišta pro uložení / zrušení změn */}
      {canEdit && (
        <div
          className={`border-border/80 bg-background/90 fixed right-0 bottom-0 left-0 z-40 border-t p-4 shadow-lg backdrop-blur-md transition-all duration-300 ${
            hasUnsavedChanges
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-full opacity-0'
          }`}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-600" />
              <span className="text-foreground text-sm font-medium">
                Máte neuložené změny v nastavení skupiny
              </span>
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
                className="gap-1.5 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Ukládám...' : 'Uložit'}
              </Button>
            </div>
          </div>
        </div>
      )}
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

  // A2: Odepření přístupu nečlenům skupiny (403 Forbidden z backendu)
  if (
    error &&
    (error.includes('oprávnění') || error.includes('403') || error.includes('Forbidden'))
  ) {
    return (
      <div className="mx-auto max-w-2xl p-6 pt-16 text-center">
        <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-foreground text-2xl font-bold">Přístup k nastavení skupiny odepřen</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          K zobrazení nastavení této skupiny nemáte dostatečná oprávnění. Stránka je přístupná pouze
          členům skupiny a administrátorům.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button variant="outline">
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

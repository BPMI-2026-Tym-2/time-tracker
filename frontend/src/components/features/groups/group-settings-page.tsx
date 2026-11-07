'use client';

import { useEffect, useState } from 'react';
import type {
  GroupMemberResponse,
  GroupSettingsResponse,
  UpdateGroupSettingsBody,
} from '@time-tracker/shared';
import { AlertCircle, Check, Trash2 } from 'lucide-react';
import { useGroupSettings } from '@/hooks/use-group-settings';
import { fetchGroupMembers } from '@/lib/api/groups';
import { Button } from '@/components/ui/button';
import { BasicInfoCard } from './settings/basic-info-card';
import { CategoriesCard } from './settings/categories-card';
import { RolesCard } from './settings/roles-card';
import { MembersCard } from './settings/members-card';
import { BackgroundCard } from './settings/background-card';
import { SettingsDialogs } from './settings/settings-dialogs';
import { SettingsSidebar } from './settings/settings-sidebar';
import {
  SettingsLoadingSkeleton,
  SettingsAccessDeniedScreen,
  SettingsErrorScreen,
  GroupDeletedScreen,
} from './settings/settings-status-screens';
import { MOCK_PREVIEW_SETTINGS } from './group-settings.constants';

type GroupSettingsPageProps = {
  groupId: string;
};

function GroupSettingsForm({
  settings,
  updateSettings,
}: {
  settings: GroupSettingsResponse;
  updateSettings: (body: UpdateGroupSettingsBody) => Promise<GroupSettingsResponse | null>;
}) {
  const canEdit = settings.permissions.canEdit;

  // Stav formuláře
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
  const [invitationCode, setInvitationCode] = useState(
    settings.invitationCode ?? settings.id.replace(/-/g, '').slice(0, 6).toUpperCase(),
  );

  // Členové & Oprávnění rolí
  const [members, setMembers] = useState<GroupMemberResponse[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [adminCanAssign, setAdminCanAssign] = useState(true);
  const [adminCanRemove, setAdminCanRemove] = useState(true);

  // Zpětná vazba a stav odesílání
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Dialogy a modální stavy
  const [showDeleteNotice, setShowDeleteNotice] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<GroupMemberResponse | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isGroupDeleted, setIsGroupDeleted] = useState(false);

  // Načtení členů skupiny
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
        if (active) setIsLoadingMembers(false);
      }
    }
    void loadMembers();
    return () => {
      active = false;
    };
  }, [settings.id]);

  // Generování nového pozvánkového kódu vlastníkem
  function handleGenerateInvitationCode() {
    if (!canEdit) return;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInvitationCode(code);
  }

  // Kopírování pozvánkového kódu do schránky
  function handleCopyInvitationCode() {
    void navigator.clipboard.writeText(invitationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  // Detekce změn (odesílá se pouze diff oproti baseline)
  const diffPayload: UpdateGroupSettingsBody = {};
  if (name !== baseline.name) diffPayload.name = name;
  if (description !== (baseline.description ?? '')) diffPayload.description = description;
  if (selectedLogo !== (baseline.logo ?? 'users')) diffPayload.logo = selectedLogo;
  if (selectedCategory !== (baseline.category ?? 'Obecná')) diffPayload.category = selectedCategory;
  if (selectedColor !== (baseline.color ?? 'blue-sky')) diffPayload.color = selectedColor;
  if (invitationCode !== (baseline.invitationCode ?? '')) {
    diffPayload.invitationCode = invitationCode;
  }
  const hasUnsavedChanges = Object.keys(diffPayload).length > 0;

  // Alternativní tok A1 / A2: Zrušení provedených změn
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
  }

  // Happy Day Scénář (HDS 12): Uložení změn na server
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

  // Obrazovka po odstranění skupiny (Alternativní tok A4)
  if (isGroupDeleted) {
    return <GroupDeletedScreen groupName={name} />;
  }

  const ownerDisplayName = settings.owner
    ? `${settings.owner.name} ${settings.owner.surname}`.trim()
    : '';

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <SettingsSidebar />

      <main className="flex-1 p-6 sm:p-8">
        <div className="mx-auto max-w-5xl space-y-5">
          <div className="pb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nastavení skupiny</h1>
          </div>

          {/* Oznámení chyb a úspěchu */}
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
          <BasicInfoCard
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            ownerName={ownerDisplayName}
            invitationCode={invitationCode}
            copiedCode={copiedCode}
            canEdit={canEdit}
            selectedLogo={selectedLogo}
            setSelectedLogo={setSelectedLogo}
            onCopyCode={handleCopyInvitationCode}
            onGenerateCode={handleGenerateInvitationCode}
          />

          {/* DVOJSLOUPEC 1: Kategorie & Role */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <CategoriesCard
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              canEdit={canEdit}
            />
            <RolesCard
              adminCanAssign={adminCanAssign}
              setAdminCanAssign={setAdminCanAssign}
              adminCanRemove={adminCanRemove}
              setAdminCanRemove={setAdminCanRemove}
              canEdit={canEdit}
            />
          </div>

          {/* DVOJSLOUPEC 2: Členové skupiny & Pozadí */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <MembersCard
              members={members}
              setMembers={setMembers}
              isLoading={isLoadingMembers}
              error={membersError}
              canEdit={canEdit}
              onOpenInvite={() => setIsInviteModalOpen(true)}
              onRequestDeleteMember={(m) => setMemberToDelete(m)}
            />
            <BackgroundCard
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              canEdit={canEdit}
            />
          </div>

          {/* Spodní akční lišta */}
          <div className="flex items-center justify-between pt-3">
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

          {/* Dialogy pro alternativní toky (A3, A4, Pozvánka) */}
          <SettingsDialogs
            groupName={name}
            showDeleteGroup={showDeleteNotice}
            onCancelDeleteGroup={() => setShowDeleteNotice(false)}
            onConfirmDeleteGroup={() => {
              setShowDeleteNotice(false);
              setIsGroupDeleted(true);
            }}
            memberToDelete={memberToDelete}
            onCancelDeleteMember={() => setMemberToDelete(null)}
            onConfirmDeleteMember={(m) => {
              setMembers((prev) => prev.filter((item) => item.id !== m.id));
              setSaveSuccessMsg(`Člen ${m.name} ${m.surname} byl odebrán ze skupiny.`);
              setTimeout(() => setSaveSuccessMsg(null), 3000);
              setMemberToDelete(null);
            }}
            isInviteOpen={isInviteModalOpen}
            onCloseInvite={() => setIsInviteModalOpen(false)}
            invitationCode={invitationCode}
            copiedCode={copiedCode}
            onCopyCode={handleCopyInvitationCode}
          />
        </div>
      </main>
    </div>
  );
}

export function GroupSettingsPage({ groupId }: GroupSettingsPageProps) {
  const isDirectPreview = groupId === 'preview';
  const [showPreview, setShowPreview] = useState(isDirectPreview);
  const { settings, isLoading, error, refetch, updateSettings } = useGroupSettings(groupId);

  if (showPreview) {
    return (
      <GroupSettingsForm
        key="preview"
        settings={MOCK_PREVIEW_SETTINGS}
        updateSettings={async (body) => ({
          ...MOCK_PREVIEW_SETTINGS,
          ...body,
          name: body.name ?? MOCK_PREVIEW_SETTINGS.name,
          description:
            body.description !== undefined ? body.description : MOCK_PREVIEW_SETTINGS.description,
          category: body.category !== undefined ? body.category : MOCK_PREVIEW_SETTINGS.category,
          logo: body.logo !== undefined ? body.logo : MOCK_PREVIEW_SETTINGS.logo,
          color: body.color !== undefined ? body.color : MOCK_PREVIEW_SETTINGS.color,
          invitationCode: body.invitationCode ?? MOCK_PREVIEW_SETTINGS.invitationCode,
        })}
      />
    );
  }

  if (isLoading) {
    return <SettingsLoadingSkeleton />;
  }

  // Alternativní tok A2: Odepření přístupu nečlenům (403 Forbidden)
  if (
    error &&
    (error.includes('oprávnění') || error.includes('403') || error.includes('Forbidden'))
  ) {
    return <SettingsAccessDeniedScreen />;
  }

  // Alternativní tok A3: Chyba načítání skupiny
  if (error || !settings) {
    return (
      <SettingsErrorScreen
        error={error}
        onRetry={() => void refetch()}
        onShowPreview={() => setShowPreview(true)}
      />
    );
  }

  return (
    <GroupSettingsForm key={settings.id} settings={settings} updateSettings={updateSettings} />
  );
}

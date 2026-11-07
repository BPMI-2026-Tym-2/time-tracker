import type { GroupSettingsResponse } from '@time-tracker/shared';
import {
  Users,
  Rocket,
  Code,
  Flame,
  Zap,
  Target,
  Globe,
  Star,
  Folder,
  GraduationCap,
  Briefcase,
  Coffee,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

export type LogoPreset = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const LOGO_PRESETS: readonly LogoPreset[] = [
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

export type CategoryPreset = {
  id: string;
  label: string;
  icon: LucideIcon | null;
};

export const CATEGORY_PRESETS: readonly CategoryPreset[] = [
  { id: 'Obecná', label: 'Obecná', icon: null },
  { id: 'Studium', label: 'Studium', icon: GraduationCap },
  { id: 'Projekt', label: 'Projekt', icon: Briefcase },
  { id: 'Volný čas', label: 'Volný čas', icon: Coffee },
  { id: 'Ostatní', label: 'Ostatní', icon: MoreHorizontal },
] as const;

export type BackgroundTheme = {
  id: string;
  name: string;
  previewClass: string;
};

export const BACKGROUND_THEMES: readonly BackgroundTheme[] = [
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

export const MOCK_PREVIEW_SETTINGS: GroupSettingsResponse = {
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
    id: 'user-jan-id',
    name: 'Jan',
    surname: 'Gergel',
    email: 'jan.gergel@unicorn.cz',
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

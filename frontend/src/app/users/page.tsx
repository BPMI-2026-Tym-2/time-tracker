import type { Metadata } from 'next';
import { UserListPage } from '@/components/features/users/user-list-page';

export const metadata: Metadata = {
  title: 'Seznam uživatelů | Time Tracker',
};

export default function UsersPage() {
  // Demo výchozí role; nahradit rolí z autentizace před nasazením.
  return <UserListPage viewerRole="superAdmin" />;
}

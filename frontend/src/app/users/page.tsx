import { UserListPage } from '@/components/features/users/user-list-page';

export default function UsersPage() {
  // Demo výchozí role; nahradit rolí z autentizace před nasazením.
  return <UserListPage viewerRole="superAdmin" />;
}

import { UserListPage } from '@/components/features/users/user-list-page';

export default function UsersPage() {
  // Dočasná hodnota, dokud se role nenačte z session v layoutu aplikace,
  // viz docs/todo-auth-session.md.
  return <UserListPage viewerRole="owner" />;
}

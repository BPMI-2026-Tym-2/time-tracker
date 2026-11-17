export type UserRole = 'Člen' | 'admin';

export type User = {
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
};

export type UserListViewerRole = 'owner' | 'admin';
export type UserListApiState =
  'loading' | 'success' | 'empty' | 'unauthenticated' | 'forbidden' | 'not-found' | 'error';

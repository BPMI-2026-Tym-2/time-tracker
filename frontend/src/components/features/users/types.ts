export type UserRole = 'Člen' | 'admin';

export type User = {
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
};

export type UserListViewerRole = 'member' | 'admin' | 'superAdmin';
export type UserListApiState =
  'loading' | 'success' | 'empty' | 'unauthenticated' | 'forbidden' | 'not-found' | 'error';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getPageMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = getPageMetadata('/users');

export default function UsersLayout({ children }: { children: ReactNode }) {
  return children;
}

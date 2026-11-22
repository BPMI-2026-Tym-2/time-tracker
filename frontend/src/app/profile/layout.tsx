import type { ReactNode } from 'react';
import { getPageMetadata } from '@/lib/page-metadata';

export const metadata = getPageMetadata('/profile');

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}

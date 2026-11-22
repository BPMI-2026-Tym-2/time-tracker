import type { Metadata } from 'next';
import { Figtree, Roboto } from 'next/font/google';
import { Suspense, type ReactNode } from 'react';
import './globals.css';
import { getPageMetadata } from '@/lib/page-metadata';
import { cn } from '@/lib/utils';
import { QueryProvider } from '@/components/providers/query-provider';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from '@/components/ui/toast';

const roboto = Roboto({ subsets: ['latin'], variable: '--font-roboto-font' });
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree-font' });

export const metadata: Metadata = getPageMetadata('/');

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="cs" className={cn('h-full', 'antialiased', roboto.variable, figtree.variable)}>
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          <Suspense fallback={null}>
            <AppShell>{children}</AppShell>
          </Suspense>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}

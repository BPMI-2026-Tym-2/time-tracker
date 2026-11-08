import type { Metadata } from 'next';
import { Figtree, Roboto, Roboto_Slab } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { cn } from '@/lib/utils';
import { getPageMetadata } from '@/lib/page-metadata';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/toast';

const roboto = Roboto({ subsets: ['latin'], variable: '--font-roboto-font' });
const robotoSlab = Roboto_Slab({ subsets: ['latin'], variable: '--font-roboto-slab-font' });
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree-font' });

export const metadata: Metadata = getPageMetadata('/');

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="cs"
      className={cn(
        'h-full',
        'antialiased',
        roboto.variable,
        robotoSlab.variable,
        figtree.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

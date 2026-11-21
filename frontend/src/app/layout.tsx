import { Geist, Geist_Mono, Figtree } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import { getPageMetadata } from '@/lib/page-metadata';
import { cn } from '@/lib/utils';

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = getPageMetadata('/');

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="cs"
      className={cn(
        'h-full',
        'antialiased',
        geistSans.variable,
        geistMono.variable,
        'font-sans',
        figtree.variable,
      )}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Time Tracker</h1>
        <p className="text-muted-foreground text-sm">
          Aplikace pro správu projektů, úkolů a týmových skupin.
        </p>
        <div className="pt-4">
          <Link href="/groups/c7a8109d-0b73-424a-a2c7-0897a8ec9df4/settings">
            <Button size="lg" className="gap-2">
              <Settings className="h-4 w-4" />
              Zobrazit nastavení skupiny
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

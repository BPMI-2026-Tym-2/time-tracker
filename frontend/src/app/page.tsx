import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ActivityResponse } from '@time-tracker/shared';
import { ActivityCalendar } from '@/components/features/activities/activity-calendar';

const previewWeek = new Date(2027, 0, 11);
const previewSlots = [
  { name: 'Plán', day: 11, start: 4, end: 5, category: 'a' },
  { name: 'Podklady', day: 11, start: 6, end: 8, category: 'b' },
  { name: 'Hovor', day: 11, start: 9, end: 10, category: 'a' },
  { name: 'Porada', day: 12, start: 6, end: 7, category: 'b' },
  { name: 'E-maily', day: 12, start: 8, end: 9, category: 'a' },
  { name: 'Čtení', day: 13, start: 5, end: 7, category: 'c' },
  { name: 'Projekt', day: 14, start: 6, end: 9, category: 'b' },
  { name: 'Revize', day: 14, start: 10, end: 11, category: 'a' },
  { name: 'Běh', day: 15, start: 5, end: 6, category: 'c' },
  { name: 'Nákup', day: 16, start: 8, end: 9, category: 'a' },
  { name: 'Tenis', day: 17, start: 7, end: 9, category: 'b' },
];

const preview: ActivityResponse[] = previewSlots.map(
  ({ name, day, start, end, category }, index) => ({
    id: `preview-${index}`,
    name,
    startedAt: new Date(2027, 0, day, start),
    endedAt: new Date(2027, 0, day, end),
    categoryIds: [category],
    tagIds: [],
  }),
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#163820]">
      <header className="border-b border-[#e5e7eb]">
        <nav
          aria-label="Hlavní navigace"
          className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-10"
        >
          <Link href="/" className="flex items-center gap-2.5 text-lg font-bold sm:text-xl">
            <Image src="/img/feather-logo.webp" alt="" width={38} height={38} />
            Záznamník
          </Link>
          <Link
            href="/overview"
            className="rounded-full border border-[#cdd2c7] px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-50"
          >
            Otevřít aplikaci
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 sm:px-10">
        <section className="space-y-9 py-10 sm:space-y-12 sm:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-5xl leading-[0.99] font-bold tracking-[-0.055em] sm:text-6xl xl:text-7xl">
              Mějte přehled o&nbsp;svém čase.
            </h1>
            <p className="mx-auto mt-6 max-w-md text-lg leading-7 text-[#4c6151]">
              Prohlížejte si osobní i týmové aktivity, spravujte skupiny a vyřizujte pozvánky na
              jednom místě.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#163820] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#285336]"
              >
                Vytvořit účet <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors hover:bg-gray-50"
              >
                Přihlásit se
              </Link>
            </div>
          </div>

          <figure className="mx-auto max-w-4xl min-w-0 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
            <figcaption className="border-b border-[#e5e7eb] px-4 py-3 text-left font-semibold sm:px-5">
              Osobní záznamník
            </figcaption>
            <ActivityCalendar weekStart={previewWeek} activities={preview} />
          </figure>
        </section>
      </main>
    </div>
  );
}

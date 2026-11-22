import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bell, BookOpen, Clock3, Users } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Vlastní záznamník',
    description: 'Udělejte si přehled o tom, čemu jste věnovali čas.',
  },
  {
    icon: Users,
    title: 'Skupiny',
    description: 'Založte skupinu, pozvěte kolegy a prohlédněte si sdílené aktivity.',
  },
  {
    icon: Bell,
    title: 'Pozvánky na jednom místě',
    description: 'Doručené pozvánky vyřídíte přímo v oznámeních.',
  },
];

const preview = [
  { name: 'Příprava podkladů', context: 'Vlastní aktivita', duration: '45 min' },
  { name: 'Týmová porada', context: 'Sdílená aktivita', duration: '30 min' },
  { name: 'Práce na projektu', context: 'Skupinová aktivita', duration: '1 h 15 min' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f9f6ef] text-[#163820]">
      <header className="border-b border-[#e8e2d6]">
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
            className="rounded-full border border-[#cdd2c7] px-4 py-2 text-sm font-semibold transition-colors hover:bg-white"
          >
            Otevřít aplikaci
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 sm:px-10">
        <section className="grid items-center gap-9 py-12 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:py-20">
          <div className="max-w-xl">
            <h1 className="font-heading text-5xl leading-[0.99] font-bold tracking-[-0.055em] sm:text-6xl xl:text-7xl">
              Mějte přehled o&nbsp;svém čase.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-7 text-[#4c6151]">
              Prohlížejte si osobní i týmové aktivity, spravujte skupiny a vyřizujte pozvánky na
              jednom místě.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#163820] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#285336]"
              >
                Vytvořit účet <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors hover:bg-[#ede9df]"
              >
                Přihlásit se
              </Link>
            </div>
          </div>

          <figure className="relative isolate overflow-hidden rounded-3xl bg-[#163820] px-5 pt-7 pb-6 shadow-xl shadow-[#163820]/10 sm:px-9 sm:pt-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0%,#446347,transparent_65%),radial-gradient(ellipse_at_0%_100%,#2f5035,transparent_65%)]"
            />
            <div className="rounded-2xl border border-white/50 bg-[#fffdf8] shadow-xl">
              <div className="flex items-center gap-3 border-b border-[#e8e2d6] px-4 py-4 sm:px-5">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#e9efe4]">
                  <Clock3 aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <p className="font-bold">Přehled aktivit</p>
                  <p className="text-xs text-[#536556]">Vlastní a týmový čas</p>
                </div>
              </div>
              <ul className="divide-y divide-[#eee9df] px-4 sm:px-5">
                {preview.map((item) => (
                  <li key={item.name} className="flex items-center justify-between gap-3 py-3.5">
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="mt-0.5 text-xs text-[#536556]">{item.context}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#eee9df] px-2.5 py-1 text-xs font-semibold tabular-nums">
                      {item.duration}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <figcaption className="mt-4 text-center text-xs text-[#ecdec8]">
              Ukázka záznamníku
            </figcaption>
          </figure>
        </section>

        <ul className="grid gap-5 border-t border-[#e8e2d6] py-8 sm:grid-cols-3 sm:gap-8">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e9efe4]">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h2 className="font-bold">{title}</h2>
                <p className="mt-1 max-w-xs text-sm leading-5 text-[#4c6151]">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

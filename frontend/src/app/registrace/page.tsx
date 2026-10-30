import Registrace from '../../components/features/Registrace';
import Image from 'next/image';
import { Roboto_Slab } from 'next/font/google';

const robotoSlab = Roboto_Slab({
  subsets: ['latin', 'latin-ext'],
});

export default function About() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-12 bg-[#f3f2f0]">
      <header className="flex -translate-x-6 items-center gap-8">
        <Image src="/Logo11.png" alt="Záznamník logo" width={100} height={100} />

        <h1 className={`text-5xl font-extrabold text-[#11231a] ${robotoSlab.className}`}>
          ZÁZNAMNÍK
        </h1>
      </header>

      <Registrace />
    </main>
  );
}

import { LucideSmile } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex w-xs flex-col gap-y-6 sm:w-md">
      <h1 className="text-center text-2xl font-bold">Zapomenuté heslo</h1>

      <span className="flex items-center justify-center">
        Bude implementováno v budoucnu&nbsp;
        <LucideSmile />
      </span>

      <div className="text-muted-foreground flex justify-between text-sm">
        <Link href="/login" className="hover:underline">
          Zpět na přihlášení
        </Link>

        <Link href="/register" className="hover:underline">
          Registrovat se
        </Link>
      </div>
    </div>
  );
}

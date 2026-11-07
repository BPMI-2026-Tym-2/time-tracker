import Link from 'next/link';
import { ShieldAlert, AlertCircle, RefreshCw, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SettingsLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
        <div className="space-y-2">
          <div className="h-7 w-52 animate-pulse rounded-md bg-slate-200" />
          <div className="h-4 w-36 animate-pulse rounded-md bg-slate-200" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}

export function SettingsAccessDeniedScreen() {
  return (
    <div className="mx-auto max-w-2xl p-6 pt-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Přístup k nastavení skupiny odepřen</h1>
      <p className="mt-2 text-sm text-slate-600">
        K zobrazení nastavení této skupiny nemáte dostatečná oprávnění. Stránka je přístupná pouze
        členům skupiny a administrátorům.
      </p>
      <div className="mt-6 flex justify-center">
        <Link href="/">
          <Button variant="outline" className="border-slate-200">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na přehled
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function SettingsErrorScreen({
  error,
  onRetry,
  onShowPreview,
}: {
  error: string | null;
  onRetry: () => void;
  onShowPreview: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl p-6 pt-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Skupinu se nepodařilo načíst</h1>
      <p className="mt-2 text-sm text-slate-600">{error ?? 'Skupina nebyla nalezena.'}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button variant="outline" className="border-slate-200">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na přehled
          </Button>
        </Link>
        <Button onClick={onRetry} variant="outline" className="border-slate-200">
          <RefreshCw className="mr-2 h-4 w-4" />
          Zkusit znovu
        </Button>
        <Button
          onClick={onShowPreview}
          className="bg-blue-600 font-medium text-white shadow-xs hover:bg-blue-700"
        >
          Zobrazit náhled designu
        </Button>
      </div>
    </div>
  );
}

export function GroupDeletedScreen({ groupName }: { groupName: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <Trash2 className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Skupina byla odstraněna</h2>
        <p className="mt-2 text-xs text-slate-600">
          Skupina <strong className="text-slate-800">{groupName}</strong> byla úspěšně odstraněna v
          souladu s alternativním tokem A4.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Zpět na přehled</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { LoginBrand } from '@/components/features/auth/login-brand';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-accent grid min-h-screen place-items-center">
      <div className="flex flex-col items-center justify-center gap-y-5">
        <LoginBrand />
        <section className="bg-background w-full max-w-lg min-w-xs rounded p-4 shadow-sm">
          {children}
        </section>
      </div>
    </main>
  );
}

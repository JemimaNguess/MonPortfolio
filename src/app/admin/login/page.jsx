import LoginForm from './LoginForm';
import { totpEnabled, adminConfigured, isAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (adminConfigured() && (await isAdmin())) redirect('/admin');
  return (
    <main className="flex min-h-dvh items-center justify-center p-5">
      <div className="glass flex w-full max-w-sm flex-col gap-5 p-7">
        <div>
          <p className="font-display text-[15px] font-bold tracking-[0.22em] text-lav">MA JEMIMA<span className="text-salmon">.</span></p>
          <h1 className="h3 mt-2 text-xl">Espace admin</h1>
        </div>
        {!adminConfigured() && (
          <p className="rounded-xl bg-salmon/15 px-3 py-2 text-sm text-salmon">
            Configuration manquante : ADMIN_EMAIL, ADMIN_PASSWORD_HASH et ADMIN_SESSION_SECRET (voir le README).
          </p>
        )}
        <LoginForm withTotp={totpEnabled()} />
      </div>
    </main>
  );
}

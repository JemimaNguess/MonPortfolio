'use client';

import { useActionState } from 'react';
import { login } from '../actions';

export default function LoginForm({ withTotp }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="email" className="text-[13px] font-medium text-[#c9c1e8]">E-mail</label>
      <input id="email" name="email" type="email" required autoComplete="username" className="field" />
      <label htmlFor="password" className="text-[13px] font-medium text-[#c9c1e8]">Mot de passe</label>
      <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      {withTotp && (
        <>
          <label htmlFor="token" className="text-[13px] font-medium text-[#c9c1e8]">Code de l&apos;application (6 chiffres)</label>
          <input id="token" name="token" inputMode="numeric" pattern="\d{6}" required autoComplete="one-time-code" className="field tracking-[0.4em]" />
        </>
      )}
      {state?.error && <p className="rounded-xl bg-salmon/15 px-3 py-2 text-sm text-salmon" role="alert">{state.error}</p>}
      <button type="submit" className="btn-primary mt-2" disabled={pending}>{pending ? 'Connexion…' : 'Se connecter'}</button>
    </form>
  );
}

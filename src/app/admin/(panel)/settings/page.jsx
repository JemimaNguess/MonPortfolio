import { getSettings } from '@/lib/data';
import { totpEnabled } from '@/lib/auth';
import { saveSettings, importSeed, reembedAll } from '../../actions';

export default async function SettingsAdmin() {
  const st = await getSettings();
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="h2 text-3xl">Réglages</h1>

      <form action={saveSettings} className="glass flex flex-col gap-4 p-5">
        <h2 className="h3">Assistante IA</h2>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="assistant_enabled" defaultChecked={st.assistant_enabled !== 'false'} />
          Réponses Gemini activées (décoche pour couper l&apos;IA en un clic : les clips continuent de fonctionner)
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#c9c1e8]">Réponses Gemini maximum par jour
            <input name="ai_daily_limit" type="number" min="0" defaultValue={st.ai_daily_limit} className="field" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#c9c1e8]">Questions maximum par visiteur et par heure
            <input name="visitor_hourly_limit" type="number" min="1" defaultValue={st.visitor_hourly_limit} className="field" />
          </label>
        </div>
        <h2 className="h3 pt-2">Disponibilité</h2>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#c9c1e8]">Phrase en français
          <input name="availability_fr" defaultValue={st.availability_fr} className="field" />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#c9c1e8]">Phrase en anglais
          <input name="availability_en" defaultValue={st.availability_en} className="field" />
        </label>
        <button type="submit" className="btn-primary self-start">Enregistrer</button>
      </form>

      <section className="glass flex flex-col gap-3 p-5">
        <h2 className="h3">Contenu</h2>
        <p className="muted">Copie dans la base tes 5 projets, tes 8 fiches de connaissances et les 20 questions du script. Rien n&apos;est écrasé si ça existe déjà.</p>
        <form action={importSeed}><button type="submit" className="btn-secondary">Importer le contenu par défaut</button></form>
        <p className="muted pt-2">Après avoir ajouté ou changé la clé Gemini, recalcule les vecteurs pour une recherche plus précise.</p>
        <form action={reembedAll}><button type="submit" className="btn-secondary">Recalculer les vecteurs</button></form>
      </section>

      <section className="glass flex flex-col gap-2 p-5">
        <h2 className="h3">Sécurité</h2>
        <p className="muted">Double authentification : {totpEnabled() ? <span className="text-lav">activée</span> : <span className="text-salmon">désactivée — lance « npm run totp-secret » et ajoute ADMIN_TOTP_SECRET</span>}.</p>
        <p className="muted">Session admin : 8 heures, cookie sécurisé. 5 essais ratés bloquent la connexion 15 minutes.</p>
      </section>
    </div>
  );
}

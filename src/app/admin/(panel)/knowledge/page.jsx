import { safeQuery } from '@/lib/db';
import { saveKnowledge, deleteKnowledge, reembedAll } from '../../actions';

export default async function KnowledgePage() {
  const rows = (await safeQuery('SELECT id, title, content, lang, embedding IS NOT NULL AS has_vec, updated_at FROM knowledge ORDER BY id')) || [];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h2 text-3xl">Base de connaissances</h1>
          <p className="muted mt-1 max-w-2xl">Tout ce que l&apos;assistante sait de toi. Elle ne répond qu&apos;à partir de ces fiches : écris-les comme tu les dirais, en phrases simples. Ne mets rien de confidentiel.</p>
        </div>
        <form action={reembedAll}><button type="submit" className="btn-secondary min-h-10 text-sm">Recalculer les vecteurs</button></form>
      </div>

      <form action={saveKnowledge} className="glass flex flex-col gap-3 p-5">
        <h2 className="h3">Nouvelle fiche</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <input name="title" required placeholder="Titre (ex. Tarifs)" className="field" aria-label="Titre" />
          <select name="lang" className="field" aria-label="Langue"><option value="fr">Français</option><option value="en">English</option></select>
        </div>
        <textarea name="content" required rows={4} placeholder="Ce que l'assistante doit savoir…" className="field" aria-label="Contenu" />
        <button type="submit" className="btn-primary self-start">Ajouter</button>
      </form>

      <div className="flex flex-col gap-4">
        {rows.map((k) => (
          <details key={k.id} className="glass p-5">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
              <span className="h3 text-base">{k.title} <span className="tag ml-2">{k.lang}</span></span>
              <span className="text-xs text-dim">{Number(k.has_vec) ? 'vecteur ✓' : 'sans vecteur'}</span>
            </summary>
            <form action={saveKnowledge} className="mt-4 flex flex-col gap-3">
              <input type="hidden" name="id" value={k.id} />
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <input name="title" defaultValue={k.title} required className="field" aria-label="Titre" />
                <select name="lang" defaultValue={k.lang} className="field" aria-label="Langue"><option value="fr">Français</option><option value="en">English</option></select>
              </div>
              <textarea name="content" defaultValue={k.content} rows={5} required className="field" aria-label="Contenu" />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary min-h-10 text-sm">Enregistrer</button>
              </div>
            </form>
            <form action={deleteKnowledge} className="mt-2">
              <input type="hidden" name="id" value={k.id} />
              <button type="submit" className="text-sm text-muted hover:text-salmon">Supprimer cette fiche</button>
            </form>
          </details>
        ))}
        {rows.length === 0 && <p className="muted">Aucune fiche en base. Va dans Réglages › « Importer le contenu par défaut » pour démarrer avec ton script.</p>}
      </div>
    </div>
  );
}

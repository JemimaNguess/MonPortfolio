import { safeQuery } from '@/lib/db';
import { saveClip, deleteClip } from '../../actions';

export default async function ClipsAdmin({ searchParams }) {
  const sp = await searchParams;
  const prefill = typeof sp?.question === 'string' ? sp.question.slice(0, 300) : '';
  const rows = (await safeQuery('SELECT id, code, question, answer_text, video_url, lang, active, embedding IS NOT NULL AS has_vec FROM clips ORDER BY code, id')) || [];
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="h2 text-3xl">Clips parlants</h1>
        <p className="muted mt-1 max-w-3xl">
          Chaque clip associe une question type à une vidéo de toi qui répond (ta vraie voix, animée avec SadTalker).
          Dépose les vidéos dans <code className="text-lav">public/clips/</code> du projet (ex. <code className="text-lav">/clips/q01-fr.mp4</code>) puis pousse sur GitHub,
          ou colle l&apos;adresse d&apos;une vidéo hébergée ailleurs. Sans vidéo, la réponse est lue par la voix du navigateur.
        </p>
      </div>

      <form action={saveClip} className="glass grid gap-3 p-5 sm:grid-cols-[100px_1fr_110px]">
        <h2 className="h3 sm:col-span-3">Nouveau clip</h2>
        <input name="code" placeholder="q21" className="field" aria-label="Code" />
        <input name="question" required defaultValue={prefill} placeholder="Question type" className="field" aria-label="Question" />
        <select name="lang" className="field" aria-label="Langue"><option value="fr">FR</option><option value="en">EN</option></select>
        <textarea name="answer_text" required rows={3} placeholder="Texte de ta réponse (sous-titres)" className="field sm:col-span-3" aria-label="Réponse" />
        <input name="video_url" placeholder="/clips/q21-fr.mp4" className="field sm:col-span-2" aria-label="Vidéo" />
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Actif</label>
        <button type="submit" className="btn-primary self-start sm:col-span-3 sm:justify-self-start">Ajouter</button>
      </form>

      <div className="flex flex-col gap-3">
        {rows.map((c) => (
          <details key={c.id} className="glass p-4">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 text-sm">
              <span><span className="tag mr-2">{c.code || '—'}</span>{c.question}</span>
              <span className="text-xs text-dim">{c.video_url ? 'vidéo ✓' : 'sans vidéo'} · {Number(c.has_vec) ? 'vecteur ✓' : 'mots-clés'} · {Number(c.active) ? 'actif' : 'inactif'}</span>
            </summary>
            <form action={saveClip} className="mt-4 grid gap-3 sm:grid-cols-[100px_1fr_110px]">
              <input type="hidden" name="id" value={c.id} />
              <input name="code" defaultValue={c.code} className="field" aria-label="Code" />
              <input name="question" defaultValue={c.question} required className="field" aria-label="Question" />
              <select name="lang" defaultValue={c.lang} className="field" aria-label="Langue"><option value="fr">FR</option><option value="en">EN</option></select>
              <textarea name="answer_text" defaultValue={c.answer_text} required rows={3} className="field sm:col-span-3" aria-label="Réponse" />
              <input name="video_url" defaultValue={c.video_url} placeholder="/clips/q01-fr.mp4" className="field sm:col-span-2" aria-label="Vidéo" />
              <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={Boolean(Number(c.active))} /> Actif</label>
              <button type="submit" className="btn-primary min-h-10 self-start text-sm sm:col-span-3 sm:justify-self-start">Enregistrer</button>
            </form>
            {c.video_url && <video src={c.video_url} controls className="mt-3 max-h-56 rounded-xl" />}
            <form action={deleteClip} className="mt-2"><input type="hidden" name="id" value={c.id} /><button type="submit" className="text-sm text-muted hover:text-salmon">Supprimer</button></form>
          </details>
        ))}
        {rows.length === 0 && <p className="muted">Aucun clip en base. Réglages › « Importer le contenu par défaut » ajoute tes 20 questions du script.</p>}
      </div>
    </div>
  );
}

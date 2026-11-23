import { notFound } from 'next/navigation';
import { safeQuery, parseJSON } from '@/lib/db';
import { saveProject } from '../../../actions';

const EMPTY = { id: '', slug: '', title_fr: '', title_en: '', kicker_fr: '', kicker_en: '', summary_fr: '', summary_en: '', body_fr: '', body_en: '', category: 'web', tags: [], image_url: '', github_url: '', demo_url: '', featured: 0, sort_order: 10, published: 1 };

function Field({ label, name, value, textarea, rows = 3, ...rest }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#c9c1e8]">
      {label}
      {textarea
        ? <textarea name={name} defaultValue={value ?? ''} rows={rows} className="field" {...rest} />
        : <input name={name} defaultValue={value ?? ''} className="field" {...rest} />}
    </label>
  );
}

export default async function EditProject({ params }) {
  const { id } = await params;
  let p = EMPTY;
  if (id !== 'new') {
    const rows = await safeQuery('SELECT * FROM projects WHERE id = ?', [Number(id)]);
    if (!rows?.length) notFound();
    p = { ...rows[0], tags: parseJSON(rows[0].tags, []) };
  }
  return (
    <form action={saveProject} className="flex max-w-4xl flex-col gap-5">
      <h1 className="h2 text-3xl">{id === 'new' ? 'Nouveau projet' : p.title_fr}</h1>
      <input type="hidden" name="id" value={p.id} />
      <div className="glass grid gap-4 p-5 sm:grid-cols-2">
        <Field label="Titre (FR)" name="title_fr" value={p.title_fr} required />
        <Field label="Titre (EN)" name="title_en" value={p.title_en} />
        <Field label="Sur-titre (FR) — ex. Web · L3 UIYA" name="kicker_fr" value={p.kicker_fr} />
        <Field label="Sur-titre (EN)" name="kicker_en" value={p.kicker_en} />
        <Field label="Résumé (FR) — une phrase" name="summary_fr" value={p.summary_fr} textarea rows={2} />
        <Field label="Résumé (EN)" name="summary_en" value={p.summary_en} textarea rows={2} />
        <Field label="Étude de cas (FR) — problème, solution, résultat" name="body_fr" value={p.body_fr} textarea rows={8} />
        <Field label="Étude de cas (EN)" name="body_en" value={p.body_en} textarea rows={8} />
      </div>
      <div className="glass grid gap-4 p-5 sm:grid-cols-2">
        <Field label="Adresse (slug) — ex. gestion-hotel" name="slug" value={p.slug} required />
        <label className="flex flex-col gap-1.5 text-[13px] font-medium text-[#c9c1e8]">
          Catégorie
          <select name="category" defaultValue={p.category} className="field">
            <option value="web">Web</option><option value="mobile">Mobile</option><option value="ia">IA</option><option value="hackathon">Hackathon</option>
          </select>
        </label>
        <Field label="Technologies (séparées par des virgules)" name="tags" value={(p.tags || []).join(', ')} />
        <Field label="Ordre d'affichage" name="sort_order" value={p.sort_order} type="number" />
        <Field label="Image (URL, ou /projets/mon-image.png dans public)" name="image_url" value={p.image_url} />
        <Field label="Lien GitHub" name="github_url" value={p.github_url} type="url" />
        <Field label="Lien démo" name="demo_url" value={p.demo_url} type="url" />
        <div className="flex flex-col justify-end gap-2 text-sm">
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={Boolean(Number(p.featured))} /> Projet phare (mis en avant)</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" name="published" defaultChecked={Boolean(Number(p.published))} /> Publié</label>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary">Enregistrer</button>
        <a href="/admin/projects" className="btn-secondary">Annuler</a>
      </div>
    </form>
  );
}

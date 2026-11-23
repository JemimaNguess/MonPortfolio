import Link from 'next/link';
import { safeQuery } from '@/lib/db';
import { deleteProject } from '../../actions';

export default async function ProjectsAdmin() {
  const rows = (await safeQuery('SELECT id, slug, title_fr, category, featured, published, sort_order FROM projects ORDER BY featured DESC, sort_order, id DESC')) || [];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h2 text-3xl">Projets</h1>
          <p className="muted mt-1">Ajoute tes projets au fur et à mesure : ils apparaissent dans la scène Projets et sur leur page d&apos;étude de cas.</p>
        </div>
        <Link href="/admin/projects/new" className="btn-primary">+ Nouveau projet</Link>
      </div>
      <div className="glass overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted">
            <tr><th className="p-3">Titre</th><th className="p-3">Catégorie</th><th className="p-3">Ordre</th><th className="p-3">État</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-lav/10">
                <td className="p-3"><Link href={`/admin/projects/${p.id}`} className="font-medium">{p.title_fr}</Link>{Number(p.featured) ? <span className="tag ml-2">phare</span> : null}</td>
                <td className="p-3 text-muted">{p.category}</td>
                <td className="p-3 text-muted">{p.sort_order}</td>
                <td className="p-3">{Number(p.published) ? <span className="text-lav">Publié</span> : <span className="text-dim">Brouillon</span>}</td>
                <td className="p-3 text-right">
                  <form action={deleteProject}><input type="hidden" name="id" value={p.id} /><button type="submit" className="text-muted hover:text-salmon">Supprimer</button></form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-4 text-muted">Aucun projet en base. Le site affiche les projets par défaut (Réglages › Importer le contenu par défaut).</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

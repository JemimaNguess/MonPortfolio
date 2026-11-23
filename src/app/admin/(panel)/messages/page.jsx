import { safeQuery, parseJSON } from '@/lib/db';
import { toggleMessage, deleteMessage } from '../../actions';

export default async function MessagesAdmin() {
  const rows = (await safeQuery('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200')) || [];
  return (
    <div className="flex flex-col gap-6">
      <h1 className="h2 text-3xl">Messages et devis</h1>
      {rows.length === 0 && <p className="muted">Aucun message pour le moment.</p>}
      <div className="flex flex-col gap-3">
        {rows.map((m) => {
          const meta = parseJSON(m.meta, null);
          return (
            <article key={m.id} className={`glass flex flex-col gap-2 p-5 ${Number(m.is_read) ? 'opacity-70' : 'border-lav'}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="h3 text-base">{m.name} <a href={`mailto:${m.email}`} className="ml-2 text-sm font-normal">{m.email}</a></p>
                <span className="text-xs text-dim">{new Date(m.created_at).toLocaleString('fr-FR')}</span>
              </div>
              <p className="text-sm font-semibold text-lav">{m.subject}{meta?.type === 'quote' ? ' · devis guidé' : ''}</p>
              <p className="whitespace-pre-line text-sm text-[#c9c1e8]">{m.message}</p>
              <div className="flex gap-4 pt-1 text-sm">
                <form action={toggleMessage}><input type="hidden" name="id" value={m.id} /><button type="submit" className="text-lav">{Number(m.is_read) ? 'Marquer non lu' : 'Marquer lu'}</button></form>
                <form action={deleteMessage}><input type="hidden" name="id" value={m.id} /><button type="submit" className="text-muted hover:text-salmon">Supprimer</button></form>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

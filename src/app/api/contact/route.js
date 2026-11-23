import { NextResponse } from 'next/server';
import { safeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

const recent = new Map(); // anti-spam simple : 5 envois par heure et par IP

function clean(v, max) {
  return String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max);
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }); }

  if (body?.website) return NextResponse.json({ ok: true }); // robot piégé

  const name = clean(body?.name, 150);
  const email = clean(body?.email, 200);
  const subject = clean(body?.subject, 200);
  const message = clean(body?.message, 4000);
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid' }, { status: 422 });
  }

  const ip = (request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for') || 'x').split(',')[0].trim();
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < 3600_000);
  if (hits.length >= 5) return NextResponse.json({ error: 'too_many' }, { status: 429 });
  hits.push(now);
  recent.set(ip, hits);

  const meta = body?.meta && typeof body.meta === 'object' ? JSON.stringify(body.meta).slice(0, 4000) : null;
  const saved = await safeQuery(
    'INSERT INTO contact_messages (name, email, subject, message, meta) VALUES (?, ?, ?, ?, ?)',
    [name, email, subject, message, meta]
  );

  let mailed = false;
  if (process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFY_EMAIL) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Ma Jemima <onboarding@resend.dev>',
          to: [process.env.CONTACT_NOTIFY_EMAIL],
          reply_to: email,
          subject: `[Portfolio] ${subject || 'Nouveau message'} — ${name}`,
          text: `${name} <${email}>\n\n${message}`,
        }),
      });
      mailed = res.ok;
    } catch (e) {
      console.error('[contact mail]', e.message);
    }
  }

  if (!saved && !mailed) {
    // Ni base ni e-mail configurés : on le signale pour que le visiteur écrive directement.
    console.error('[contact] message non enregistré (configure MySQL ou Resend)');
    return NextResponse.json({ error: 'not_stored' }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}

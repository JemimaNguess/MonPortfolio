import { NextResponse } from 'next/server';
import { answerQuestion } from '@/lib/assistant';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }); }
  const question = String(body?.question || '').slice(0, 500);
  const lang = body?.lang === 'en' ? 'en' : 'fr';
  const sessionId = String(body?.sessionId || '').slice(0, 64);
  const ip = (request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  try {
    const result = await answerQuestion({ question, lang, sessionId, ip });
    return NextResponse.json(result);
  } catch (e) {
    console.error('[chat]', e);
    return NextResponse.json({ source: 'fallback', answer: lang === 'en' ? 'Something went wrong. Try again?' : 'Petit souci de mon côté. Tu peux réessayer ?', action: 'none' });
  }
}

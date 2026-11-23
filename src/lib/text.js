// Petits outils texte, utilisables côté serveur et client.
export function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP = new Set('le la les un une des de du et a au aux en est tu te ton ta tes je me mon ma mes que qui quoi quel quelle quels quelles pour avec sur dans ce cet cette ces il elle on nous vous ils elles ne pas plus the a an of to and is are you your what which how do does i my in on for with'.split(' '));

export function keywords(s) {
  return normalize(s).split(' ').filter((w) => w.length > 2 && !STOP.has(w));
}

// Similarité simple par mots-clés (repli quand Gemini n'est pas configuré).
export function overlapScore(a, b) {
  const ka = new Set(keywords(a));
  const kb = new Set(keywords(b));
  if (!ka.size || !kb.size) return 0;
  let common = 0;
  for (const w of ka) if (kb.has(w)) common++;
  return common / Math.min(ka.size, kb.size);
}

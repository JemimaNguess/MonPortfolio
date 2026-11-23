import 'server-only';

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export function geminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function call(path, body) {
  const res = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`GEMINI_${res.status}: ${text.slice(0, 300)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Vecteur d'un texte (768 dimensions suffisent largement pour une petite base).
export async function embed(text, taskType = 'RETRIEVAL_QUERY') {
  const model = process.env.GEMINI_EMBED_MODEL || 'gemini-embedding-001';
  const data = await call(`${model}:embedContent`, {
    content: { parts: [{ text: String(text).slice(0, 6000) }] },
    taskType,
    outputDimensionality: 768,
  });
  return data?.embedding?.values || null;
}

// Réponse structurée : { answer, action, project }
export async function generateAnswer({ system, prompt, schema }) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const generationConfig = {
    temperature: 0.6,
    maxOutputTokens: 600,
    responseMimeType: 'application/json',
    responseSchema: schema,
  };
  if (model.includes('2.5-flash')) generationConfig.thinkingConfig = { thinkingBudget: 0 };
  const data = await call(`${model}:generateContent`, {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig,
  });
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  try {
    return JSON.parse(text);
  } catch {
    return { answer: text.trim(), action: 'none' };
  }
}

export function cosine(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

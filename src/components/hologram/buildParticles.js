import * as THREE from 'three';

// Transforme une photo (fond transparent ou uni) en nuage de particules en relief.
export function buildParticles(img, { rows = 200, worldH = 2.6, relief = 0.55, bgThreshold = 60 } = {}) {
  let H = rows;
  let W = Math.round((rows * img.width) / img.height);
  if (W > 230) { W = 230; H = Math.round((W * img.height) / img.width); }
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, W, H);
  const data = ctx.getImageData(0, 0, W, H).data;

  // Couleur du fond = moyenne des bords (utile si la photo n'a pas de transparence)
  let br = 0, bg = 0, bb = 0, n = 0;
  const add = (x, y) => { const i = (y * W + x) * 4; br += data[i]; bg += data[i + 1]; bb += data[i + 2]; n++; };
  for (let x = 0; x < W; x++) { add(x, 0); add(x, 1); }
  for (let y = 0; y < H; y++) { add(0, y); add(W - 1, y); }
  br /= n; bg /= n; bb /= n;

  let transparent = 0;
  for (let k = 3; k < data.length; k += 16) if (data[k] < 40) transparent++;
  const hasAlpha = transparent > data.length / 160;

  const kept = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (data[i + 3] < 40) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (!hasAlpha && Math.hypot(r - br, g - bg, b - bb) < bgThreshold) continue;
      kept.push(x, y, (0.299 * r + 0.587 * g + 0.114 * b) / 255);
    }
  }
  // Luminosité normalisée : les peaux foncées et les vêtements noirs restent visibles
  const Ls = [];
  for (let k = 2; k < kept.length; k += 3) Ls.push(kept[k]);
  Ls.sort((a, b) => a - b);
  const lo = Ls[Math.floor(Ls.length * 0.02)] ?? 0;
  const hi = Ls[Math.floor(Ls.length * 0.985)] ?? 1;
  const span = Math.max(0.05, hi - lo);
  const spacing = worldH / H;

  const count = kept.length / 3;
  const pos = new Float32Array(count * 3);
  const start = new Float32Array(count * 3);
  const lum = new Float32Array(count);
  const delay = new Float32Array(count);
  const rnd = new Float32Array(count);

  for (let k = 0, j = 0; k < kept.length; k += 3, j++) {
    const x = kept[k], y = kept[k + 1];
    const L = Math.pow(Math.min(1, Math.max(0, (kept[k + 2] - lo) / span)), 0.8);
    const nx = (x / W - 0.5) * 2, ny = (y / H - 0.5) * 2;
    const bulge = Math.sqrt(Math.max(0, 1 - nx * nx * 0.95 - ny * ny * 0.25));
    const jitter = (Math.random() - 0.5) * spacing * 0.6;
    pos[j * 3] = (x / W - 0.5) * worldH * (W / H) + jitter;
    pos[j * 3 + 1] = -(y / H - 0.5) * worldH + jitter;
    pos[j * 3 + 2] = ((L - 0.5) * 0.55 + bulge * 0.75) * relief * 1.4;
    const a = Math.random() * Math.PI * 2, rad = 2.2 + Math.random() * 3.5;
    start[j * 3] = Math.cos(a) * rad;
    start[j * 3 + 1] = -2.6 + Math.random() * 5.5;
    start[j * 3 + 2] = Math.sin(a) * rad - 1.0;
    lum[j] = L;
    delay[j] = (1 - y / H) * 0.42 + Math.random() * 0.18;
    rnd[j] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
  geometry.setAttribute('aLum', new THREE.BufferAttribute(lum, 1));
  geometry.setAttribute('aDelay', new THREE.BufferAttribute(delay, 1));
  geometry.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
  geometry.computeBoundingSphere();
  return { geometry, spacing };
}

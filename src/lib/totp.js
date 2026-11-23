import 'server-only';
import crypto from 'node:crypto';

// TOTP (RFC 6238) compatible Google Authenticator, Authy, etc.
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Decode(input) {
  const clean = String(input).replace(/=+$/, '').replace(/\s/g, '').toUpperCase();
  let bits = '';
  for (const ch of clean) {
    const v = B32.indexOf(ch);
    if (v < 0) throw new Error('Secret TOTP invalide');
    bits += v.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function hotp(key, counter) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac('sha1', key).update(buf).digest();
  const off = h[h.length - 1] & 0xf;
  const code = ((h[off] & 0x7f) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3];
  return String(code % 1_000_000).padStart(6, '0');
}

export function verifyTotp(secret, token, window = 1) {
  if (!/^\d{6}$/.test(String(token || ''))) return false;
  const key = base32Decode(secret);
  const step = Math.floor(Date.now() / 30000);
  for (let w = -window; w <= window; w++) {
    const expected = hotp(key, step + w);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(token)))) return true;
  }
  return false;
}

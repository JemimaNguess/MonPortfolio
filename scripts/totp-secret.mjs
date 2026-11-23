// Génère un secret pour la double authentification (Google Authenticator, Authy…)
import crypto from 'node:crypto';

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const bytes = crypto.randomBytes(20);
let bits = '';
for (const b of bytes) bits += b.toString(2).padStart(8, '0');
let secret = '';
for (let i = 0; i + 5 <= bits.length; i += 5) secret += B32[parseInt(bits.slice(i, i + 5), 2)];

const email = process.env.ADMIN_EMAIL || 'admin';
const uri = `otpauth://totp/Ma%20Jemima:${encodeURIComponent(email)}?secret=${secret}&issuer=Ma%20Jemima`;
console.log('\nADMIN_TOTP_SECRET=' + secret);
console.log('\nDans ton appli d’authentification, ajoute un compte avec cette clé (saisie manuelle) :');
console.log(secret);
console.log('\nou ce lien otpauth :\n' + uri + '\n');

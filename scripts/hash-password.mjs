// Usage : npm run hash-password -- "ton-mot-de-passe"
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const pwd = process.argv[2];
if (!pwd || pwd.length < 10) {
  console.error('Donne un mot de passe d’au moins 10 caractères : npm run hash-password -- "mon-mot-de-passe"');
  process.exit(1);
}
const hash = await bcrypt.hash(pwd, 12);
const secret = crypto.randomBytes(32).toString('hex');
console.log('\n── Pour le fichier .env.local (les $ doivent être précédés d\'un \\) ──');
console.log('ADMIN_PASSWORD_HASH=' + hash.replace(/\$/g, '\\$'));
console.log('ADMIN_SESSION_SECRET=' + secret);
console.log('\n── Pour Netlify (Site configuration > Environment variables), valeurs telles quelles ──');
console.log('ADMIN_PASSWORD_HASH  ' + hash);
console.log('ADMIN_SESSION_SECRET ' + secret + '\n');

# Ma Jemima — portfolio holographique

Le portfolio de Jemima N'Guessan : un hologramme fait à partir de sa photo l'accueille, parle, répond aux questions (clips avec sa vraie voix + Gemini) et fait visiter 9 scènes. Un espace admin permet de tout gérer.

**Stack** : Next.js 16 (App Router, JavaScript/JSX) · React Three Fiber · Tailwind CSS 4 · MySQL (mysql2) · API Gemini · Netlify.

---

## 1. Installer en local

Prérequis : Node.js 22, XAMPP (ou MySQL 8), Git.

```bash
npm install
cp .env.example .env.local      # puis remplis les valeurs (voir plus bas)
npm run dev                     # http://localhost:3000
```

Le site fonctionne **même sans base de données ni clé Gemini** : il affiche le contenu par défaut (`src/lib/seed.js`) et l'hologramme répond avec les textes du script.

## 2. Base MySQL

1. Démarre MySQL dans XAMPP.
2. phpMyAdmin › Importer › `database/schema.sql` (crée la base `ma_jemima` et ses 6 tables).
3. Dans `.env.local` : `DATABASE_HOST=127.0.0.1`, `DATABASE_USER=root`, `DATABASE_PASSWORD=`, `DATABASE_NAME=ma_jemima`.
4. Connecte-toi à l'admin › Réglages › **Importer le contenu par défaut** (projets, fiches de connaissances, 20 questions du script).

**En ligne**, Netlify ne peut pas joindre ton MySQL local. Utilise une base MySQL hébergée, par exemple **TiDB Cloud Starter** (gratuit, compatible MySQL) :
créer un cluster › Connect › récupérer hôte, port (4000), utilisateur, mot de passe › importer `schema.sql` (sans la ligne `CREATE DATABASE`/`USE` si la base existe déjà) › mettre `DATABASE_SSL=true`.

## 3. Assistante Gemini

1. Crée une clé gratuite : https://aistudio.google.com/apikey (ton abonnement Google AI Plus ne remplace pas cette clé).
2. `GEMINI_API_KEY=...` dans `.env.local` et sur Netlify.
3. Admin › Réglages › **Recalculer les vecteurs** (pour la recherche par le sens).

Comment l'hologramme répond :
1. **Clip** : si la question ressemble à une question du script, il joue ta vidéo (ou lit le texte si la vidéo n'existe pas encore).
2. **Gemini** : sinon, Gemini répond à partir de ta base de connaissances, et peut ouvrir une scène (projets, contact, devis…).
3. **Repli** : sans Gemini ou quota atteint, il oriente vers la bonne scène ou le formulaire de contact.

Les limites (réponses Gemini par jour, questions par visiteur et par heure) et l'interrupteur de l'IA sont dans Admin › Réglages. La clé n'est **jamais** envoyée au navigateur : tout passe par `/api/chat`.

## 4. Espace admin (`/admin`)

```bash
npm run hash-password -- "ton-mot-de-passe-solide"
npm run hash-password -- "Jemoce@170607!"
```
Copie les lignes affichées : la version « .env.local » (avec `\$`) dans `.env.local`, la version « Netlify » (sans `\`) dans Netlify. Ajoute aussi `ADMIN_EMAIL`.

Double authentification (recommandée) :
```bash
npm run totp-secret
```
Ajoute la clé dans Google Authenticator / Authy, puis `ADMIN_TOTP_SECRET=...` dans les variables.

Ce que tu peux faire dans l'admin :

| Page | Rôle |
| --- | --- |
| Tableau de bord | Questions du jour et de la semaine, consommation Gemini, messages non lus, questions sans clip les plus posées (bouton « Créer un clip ») |
| Connaissances | Ce que l'assistante sait de toi (fiches FR/EN) |
| Projets | Ajouter, modifier, publier tes projets et leurs études de cas |
| Clips parlants | Associer une question type à une vidéo de toi |
| Questions posées | Historique anonymisé (30 jours) |
| Messages | Formulaire de contact et devis guidés |
| Réglages | Couper l'IA, quotas, phrase de disponibilité, import du contenu, état de la 2FA |

## 5. Clips parlants (ta vraie voix)

1. Enregistre chaque réponse du script avec ton téléphone (une par fichier).
2. Dans Google Colab, avec **SadTalker** : ta photo + l'audio → une vidéo qui parle.
3. Dépose les vidéos dans `public/clips/` (ex. `q01-fr.mp4`, carré 512 px, < 2 Mo) et pousse sur GitHub.
4. Admin › Clips parlants › renseigne `/clips/q01-fr.mp4` sur la question correspondante.

Le site applique lui-même l'effet hologramme (teinte lavande, lignes de balayage) sur la vidéo.

## 6. Changer la photo de l'hologramme

Remplace `public/holo/portrait.png` par ta photo **détourée (fond transparent)** ou sur **fond uni**, de face, environ 500 px de haut. `public/holo/holo-preview.png` sert d'image d'aperçu quand on partage le lien.

## 7. Mettre en ligne sur Netlify (même adresse que ton CV)

1. Pousse ce projet dans ton repo `MonPortfolio` (il remplace l'ancien site).
2. Netlify › ton site `jemimasportfolio` › Site configuration › Build & deploy : commande `npm run build`, dossier `.next` (Netlify détecte Next.js tout seul).
3. Site configuration › Environment variables : ajoute toutes les variables de `.env.example`.
4. Redéploie. L'adresse https://jemimasportfolio.netlify.app ne change pas.

## 8. Où modifier quoi

| Je veux changer… | Fichier |
| --- | --- |
| Les textes du site (FR/EN) | `src/dictionaries/fr.js`, `src/dictionaries/en.js` |
| Les couleurs, polices, boutons | `src/app/globals.css` |
| Une scène | `src/components/scenes/*.jsx` |
| L'hologramme (effets, position) | `src/components/hologram/` |
| Le comportement de l'assistante | `src/lib/assistant.js` |
| Le contenu par défaut | `src/lib/seed.js` |

Les passages entre crochets `[ ]` sont à compléter (tarifs, SantéAI, stage, WhatsApp, thèmes de formation…).

## 9. Confidentialité

- Questions à l'hologramme : IP remplacée par une empreinte chiffrée, purge des données de plus de 30 jours depuis l'admin.
- Caméra du Labo : détection dans le navigateur (MediaPipe), rien n'est envoyé.
- Mentions légales : `src/app/[locale]/mentions-legales/page.jsx`.

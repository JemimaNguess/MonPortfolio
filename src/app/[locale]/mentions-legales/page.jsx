import { getDictionary } from '@/dictionaries';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return { title: getDictionary(locale).legal.title };
}

export default async function Legal({ params }) {
  const { locale } = await params;
  const d = getDictionary(locale);
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-12 text-[15px] leading-relaxed text-[#c9c1e8]">
      <a href={`/${locale}`} className="text-sm font-semibold">← {d.common.back}</a>
      <h1 className="h2">{d.legal.title}</h1>
      <section className="flex flex-col gap-2">
        <h2 className="h3">Éditrice du site</h2>
        <p>N&apos;GUESSAN Moayé Jemima, développeuse web et mobile, Abidjan, Côte d&apos;Ivoire. Contact : jemimaoceanenguessan@gmail.com.</p>
        <p>Hébergement : Netlify, Inc., San Francisco, États-Unis.</p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="h3">L&apos;hologramme et l&apos;assistante IA</h2>
        <p>L&apos;hologramme est un avatar animé, créé à partir de la photo et de la voix de Jemima, avec son accord. Les réponses aux questions fréquentes sont enregistrées par Jemima elle-même ; les autres réponses sont générées par une intelligence artificielle (Google Gemini) à partir d&apos;informations fournies par Jemima. Elles peuvent contenir des erreurs : pour toute décision, contacte Jemima directement.</p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="h3">Données personnelles</h2>
        <p>Questions posées à l&apos;hologramme : conservées 30 jours au maximum, sans ton nom ; ton adresse IP est remplacée par une empreinte chiffrée. Elles servent à améliorer les réponses. Le texte des questions est transmis à Google pour générer la réponse.</p>
        <p>Formulaire de contact : ton nom, ton e-mail et ton message servent uniquement à te répondre.</p>
        <p>Caméra (scène Labo) : l&apos;image est analysée dans ton navigateur et n&apos;est ni enregistrée ni envoyée.</p>
        <p>Micro : la reconnaissance vocale est assurée par ton navigateur.</p>
        <p>Pour faire supprimer tes données : écris à jemimaoceanenguessan@gmail.com.</p>
      </section>
    </main>
  );
}

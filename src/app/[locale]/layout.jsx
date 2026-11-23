import '../globals.css';
import { notFound } from 'next/navigation';
import { LOCALES, isLocale } from '@/lib/i18n';
import { getDictionary } from '@/dictionaries';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://jemimasportfolio.netlify.app';
  return {
    metadataBase: new URL(site),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: { languages: { fr: '/fr', en: '/en' } },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      images: ['/holo/holo-preview.png'],
      locale: locale === 'en' ? 'en_US' : 'fr_FR',
      type: 'website',
    },
  };
}

export const viewport = { themeColor: '#07060d', width: 'device-width', initialScale: 1 };

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale}>
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          precedence="default"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
        />
        {children}
      </body>
    </html>
  );
}

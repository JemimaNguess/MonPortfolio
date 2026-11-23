import Experience from '@/components/experience/Experience';
import { getDictionary } from '@/dictionaries';
import { getProjects, getSettings } from '@/lib/data';

export const revalidate = 300; // les projets modifiés dans l'admin apparaissent en 5 minutes max

export default async function Page({ params }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const [projects, settings] = await Promise.all([getProjects(), getSettings()]);
  const availability = settings[`availability_${locale}`] || '';
  return <Experience dict={dict} locale={locale} projects={projects} availability={availability} />;
}

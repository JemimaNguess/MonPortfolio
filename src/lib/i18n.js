export const LOCALES = ['fr', 'en'];
export const DEFAULT_LOCALE = 'fr';

export function isLocale(value) {
  return LOCALES.includes(value);
}

export function pick(obj, field, locale) {
  // Renvoie le champ dans la langue demandée, avec repli sur le français.
  return (obj && (obj[`${field}_${locale}`] || obj[`${field}_fr`])) || '';
}

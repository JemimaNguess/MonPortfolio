import fr from './fr';
import en from './en';

const dictionaries = { fr, en };

export function getDictionary(locale) {
  return dictionaries[locale] || fr;
}

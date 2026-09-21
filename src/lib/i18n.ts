import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../locales/en/translation.json';
import translationFR from '../locales/fr/translation.json';

/** Shared with reps / company — keep language across microfrontends. */
export const HARX_LANG_KEY = 'i18nextLng';

export function readHarxLanguage(): 'fr' | 'en' {
  try {
    const raw = localStorage.getItem(HARX_LANG_KEY) || '';
    if (raw.toLowerCase().startsWith('en')) return 'en';
    if (raw.toLowerCase().startsWith('fr')) return 'fr';
  } catch {
    /* ignore */
  }
  return 'fr';
}

export function persistHarxLanguage(lang: string): void {
  const normalized = lang.toLowerCase().startsWith('en') ? 'en' : 'fr';
  try {
    localStorage.setItem(HARX_LANG_KEY, normalized);
  } catch {
    /* ignore */
  }
}

const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: readHarxLanguage(),
  fallbackLng: 'fr',
  supportedLngs: ['en', 'fr'],
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  persistHarxLanguage(lng);
});

export default i18n;

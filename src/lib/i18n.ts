import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getLangFromPath } from './langRoutes';
import translationEN from '../locales/en/translation.json';
import translationFR from '../locales/fr/translation.json';

/** Shared with reps / company — keep language across microfrontends. */
export const HARX_LANG_KEY = 'i18nextLng';
/** Set only when the user picks a language in the switcher. */
export const HARX_LANG_EXPLICIT_KEY = 'harxLangExplicit';

/** Première langue prise en charge (fr, en) parmi les préférences du navigateur, sinon null. */
export function detectBrowserLanguage(): 'fr' | 'en' | null {
  if (typeof navigator === 'undefined') return null;
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    const lang = (candidate || '').toLowerCase();
    if (lang.startsWith('fr')) return 'fr';
    if (lang.startsWith('en')) return 'en';
  }
  return null;
}

/**
 * Langue à afficher : le choix explicite (sélecteur ou URL /fr, /en) prime ;
 * sinon la langue du navigateur (fr ou en) ; sinon le français.
 */
export function readHarxLanguage(): 'fr' | 'en' {
  try {
    const raw = (localStorage.getItem(HARX_LANG_KEY) || '').toLowerCase();
    const explicit = localStorage.getItem(HARX_LANG_EXPLICIT_KEY) === '1';
    if (explicit && raw.startsWith('en')) return 'en';
    if (explicit && raw.startsWith('fr')) return 'fr';
  } catch {
    /* ignore */
  }
  return detectBrowserLanguage() ?? 'fr';
}

export function persistHarxLanguage(lang: string, opts?: { explicit?: boolean }): void {
  const normalized = lang.toLowerCase().startsWith('en') ? 'en' : 'fr';
  try {
    const previous = (localStorage.getItem(HARX_LANG_KEY) || '').toLowerCase().slice(0, 2);
    localStorage.setItem(HARX_LANG_KEY, normalized);
    if (opts?.explicit) {
      localStorage.setItem(HARX_LANG_EXPLICIT_KEY, '1');
    } else if (previous !== normalized) {
      // La langue change sans choix explicite : l'ancien choix explicite n'est plus valable.
      localStorage.removeItem(HARX_LANG_EXPLICIT_KEY);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Applique la langue. Une langue anglaise détectée est enregistrée comme choix partagé,
 * car les modules reps et company ne gardent l'anglais que s'il est « explicite ».
 */
export function applyHarxLanguage(): Promise<string> {
  const desired = readHarxLanguage();
  persistHarxLanguage(desired, { explicit: desired === 'en' });
  if (typeof document !== 'undefined') document.documentElement.lang = desired;
  if (i18n.language?.toLowerCase().startsWith(desired)) {
    return Promise.resolve(desired);
  }
  return i18n.changeLanguage(desired).then(() => desired);
}

/** La langue de l'URL (/fr, /en) prime : le préfixe vaut choix explicite. */
export function syncLanguageFromPath(pathname: string): void {
  const lang = getLangFromPath(pathname);
  if (!lang) return;
  persistHarxLanguage(lang, { explicit: true });
  if (!i18n.language?.toLowerCase().startsWith(lang)) {
    void i18n.changeLanguage(lang);
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

if (typeof window !== 'undefined') {
  const urlLang = getLangFromPath(window.location.pathname);
  if (urlLang) persistHarxLanguage(urlLang, { explicit: true });
}

void i18n.use(initReactI18next).init({
  resources,
  lng: readHarxLanguage(),
  fallbackLng: 'fr',
  supportedLngs: ['en', 'fr'],
  interpolation: {
    escapeValue: false,
  },
}).then(() => applyHarxLanguage());

i18n.on('languageChanged', (lng) => {
  persistHarxLanguage(lng);
  if (typeof document !== 'undefined') document.documentElement.lang = lng.toLowerCase().startsWith('en') ? 'en' : 'fr';
});

export default i18n;

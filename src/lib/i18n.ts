import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getLangFromPath, isRtlLang, normalizeSiteLang, SITE_LANGS, type SiteLang } from './langRoutes';
import translationEN from '../locales/en/translation.json';
import translationFR from '../locales/fr/translation.json';
import translationES from '../locales/es/translation.json';
import translationAR from '../locales/ar/translation.json';

/** Shared with reps / company — keep language across microfrontends. */
export const HARX_LANG_KEY = 'i18nextLng';
/** Set only when the user picks a language in the switcher. */
export const HARX_LANG_EXPLICIT_KEY = 'harxLangExplicit';
/**
 * Langue de ce site (fr, en, es, ar). Les modules reps et company ne connaissent que le français et l'anglais :
 * la clé partagée `i18nextLng` ne reçoit donc jamais es ni ar (anglais à la place), et la vraie langue est gardée ici.
 */
export const HARX_SITE_LANG_KEY = 'harxSiteLang';

/** Première langue prise en charge (fr, en, es, ar) parmi les préférences du navigateur, sinon null. */
export function detectBrowserLanguage(): SiteLang | null {
  if (typeof navigator === 'undefined') return null;
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    const code = (candidate || '').toLowerCase().slice(0, 2);
    if ((SITE_LANGS as readonly string[]).includes(code)) return code as SiteLang;
  }
  return null;
}

/**
 * Langue à afficher : le choix explicite (icônes de langue ou URL /fr, /en, /es, /ar) prime ;
 * sinon la langue du navigateur (fr, en, es, ar) ; sinon le français.
 */
export function readHarxLanguage(): SiteLang {
  try {
    const explicit = localStorage.getItem(HARX_LANG_EXPLICIT_KEY) === '1';
    if (explicit) {
      const site = (localStorage.getItem(HARX_SITE_LANG_KEY) || '').toLowerCase();
      if ((SITE_LANGS as readonly string[]).includes(site)) return site as SiteLang;
      const raw = (localStorage.getItem(HARX_LANG_KEY) || '').toLowerCase();
      if (raw.startsWith('en')) return 'en';
      if (raw.startsWith('fr')) return 'fr';
    }
  } catch {
    /* ignore */
  }
  return detectBrowserLanguage() ?? 'fr';
}

export function persistHarxLanguage(lang: string, opts?: { explicit?: boolean }): void {
  const normalized = normalizeSiteLang(lang);
  // Clé partagée avec reps / company : uniquement fr ou en (es et ar se replient sur l'anglais).
  const shared = normalized === 'fr' ? 'fr' : 'en';
  try {
    const previous = (localStorage.getItem(HARX_SITE_LANG_KEY) || localStorage.getItem(HARX_LANG_KEY) || '').toLowerCase().slice(0, 2);
    localStorage.setItem(HARX_LANG_KEY, shared);
    localStorage.setItem(HARX_SITE_LANG_KEY, normalized);
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

/** Langue et sens d'écriture du document (l'arabe se lit de droite à gauche). */
export function applyDocumentLanguage(lang: string): void {
  if (typeof document === 'undefined') return;
  const normalized = normalizeSiteLang(lang);
  document.documentElement.lang = normalized;
  document.documentElement.dir = isRtlLang(normalized) ? 'rtl' : 'ltr';
}

/**
 * Applique la langue. Une langue anglaise détectée est enregistrée comme choix partagé,
 * car les modules reps et company ne gardent l'anglais que s'il est « explicite ».
 */
export function applyHarxLanguage(): Promise<string> {
  const desired = readHarxLanguage();
  persistHarxLanguage(desired, { explicit: desired !== 'fr' });
  applyDocumentLanguage(desired);
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
  es: {
    translation: translationES,
  },
  ar: {
    translation: translationAR,
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
  supportedLngs: ['en', 'fr', 'es', 'ar'],
  interpolation: {
    escapeValue: false,
  },
}).then(() => applyHarxLanguage());

i18n.on('languageChanged', (lng) => {
  persistHarxLanguage(lng);
  applyDocumentLanguage(lng);
});

export default i18n;

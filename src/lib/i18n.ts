import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../locales/en/translation.json';
import translationFR from '../locales/fr/translation.json';

/** Shared with reps / company — keep language across microfrontends. */
export const HARX_LANG_KEY = 'i18nextLng';
/** Set only when the user picks a language in the switcher. */
export const HARX_LANG_EXPLICIT_KEY = 'harxLangExplicit';

export function readHarxLanguage(): 'fr' | 'en' {
  try {
    const raw = (localStorage.getItem(HARX_LANG_KEY) || '').toLowerCase();
    const explicit = localStorage.getItem(HARX_LANG_EXPLICIT_KEY) === '1';
    // English only when the user explicitly chose it in the language menu.
    if (raw.startsWith('en') && explicit) return 'en';
  } catch {
    /* ignore */
  }
  return 'fr';
}

export function persistHarxLanguage(lang: string, opts?: { explicit?: boolean }): void {
  const normalized = lang.toLowerCase().startsWith('en') ? 'en' : 'fr';
  try {
    localStorage.setItem(HARX_LANG_KEY, normalized);
    if (opts?.explicit) {
      localStorage.setItem(HARX_LANG_EXPLICIT_KEY, '1');
    } else if (normalized === 'fr') {
      // Migrating to default French clears a stale accidental English preference.
      localStorage.removeItem(HARX_LANG_EXPLICIT_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** Apply preferred language (default FR). Safe to call on mount. */
export function applyHarxLanguage(): Promise<string> {
  const desired = readHarxLanguage();
  persistHarxLanguage(desired);
  if (i18n.language?.toLowerCase().startsWith(desired)) {
    return Promise.resolve(desired);
  }
  return i18n.changeLanguage(desired).then(() => desired);
}

const resources = {
  en: {
    translation: translationEN,
  },
  fr: {
    translation: translationFR,
  },
};

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
  // Don't let non-explicit changes lock English as the default.
  const explicit = (() => {
    try {
      return localStorage.getItem(HARX_LANG_EXPLICIT_KEY) === '1';
    } catch {
      return false;
    }
  })();
  if (lng.toLowerCase().startsWith('en') && !explicit) {
    void i18n.changeLanguage('fr');
    return;
  }
  persistHarxLanguage(lng, explicit ? { explicit: true } : undefined);
});

export default i18n;

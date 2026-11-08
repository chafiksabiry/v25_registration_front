import React from 'react';
import { useTranslation } from 'react-i18next';
import { persistHarxLanguage } from '../../lib/i18n';
import { hardNavigate } from '../../lib/appNavigation';
import { isPrefixablePath, stripLangPrefix, withLangPrefix } from '../../lib/langRoutes';

type LangId = 'fr' | 'en' | 'es' | 'ar';

/** Langues réellement disponibles ; l'espagnol et l'arabe sont annoncés mais leurs textes n'existent pas encore. */
const AVAILABLE: LangId[] = ['fr', 'en'];

const FlagFr = () => (
  <svg viewBox="0 0 3 2" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="3" height="2" fill="#ED2939" />
    <rect width="2" height="2" fill="#fff" />
    <rect width="1" height="2" fill="#002395" />
  </svg>
);

const FlagEn = () => (
  <svg viewBox="0 0 60 30" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <clipPath id="lang-en-s"><path d="M0,0 v30 h60 v-30 z" /></clipPath>
    <clipPath id="lang-en-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
    <g clipPath="url(#lang-en-s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#lang-en-t)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

const FlagEs = () => (
  <svg viewBox="0 0 3 2" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="3" height="2" fill="#AA151B" />
    <rect y="0.5" width="3" height="1" fill="#F1BF00" />
  </svg>
);

/** L'arabe n'a pas de drapeau : pastille verte avec la lettre « ع » (ayn), sans référence à un pays. */
const BadgeAr = () => (
  <span className="flex h-full w-full items-center justify-center bg-emerald-600 text-[15px] font-bold leading-none text-white" aria-hidden="true">ع</span>
);

const ICONS: Record<LangId, { Icon: React.ComponentType; name: string }> = {
  fr: { Icon: FlagFr, name: 'Français' },
  en: { Icon: FlagEn, name: 'English' },
  es: { Icon: FlagEs, name: 'Español' },
  ar: { Icon: BadgeAr, name: 'العربية' },
};

const ORDER: LangId[] = ['fr', 'en', 'es', 'ar'];

/** Choix de la langue par icônes rondes (français, anglais, espagnol, arabe) à la place d'une liste déroulante. */
export function LanguageIcons({ className = '' }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const current: LangId = i18n.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';

  const select = (lang: LangId) => {
    if (!AVAILABLE.includes(lang) || lang === current) return;
    persistHarxLanguage(lang, { explicit: true });
    const { pathname, search, hash } = window.location;
    if (isPrefixablePath(pathname)) {
      // Page publique : une URL par langue (/fr/…, /en/…), rechargement complet.
      hardNavigate(`${withLangPrefix(stripLangPrefix(pathname), lang as 'fr' | 'en')}${search}${hash}`);
      return;
    }
    void i18n.changeLanguage(lang);
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full bg-black/15 p-1.5 ring-1 ring-white/25 backdrop-blur-md ${className}`} role="group" aria-label={t('header.language', 'Language')} data-testid="language-icons">
      {ORDER.map((lang) => {
        const { Icon, name } = ICONS[lang];
        const available = AVAILABLE.includes(lang);
        const active = lang === current;
        return (
          <button
            key={lang}
            type="button"
            onClick={() => select(lang)}
            disabled={!available}
            aria-pressed={active}
            aria-label={available ? name : `${name} — ${t('choicePage.comingSoon', 'Coming soon')}`}
            title={available ? name : `${name} — ${t('choicePage.comingSoon', 'Coming soon')}`}
            data-testid={`lang-${lang}`}
            className={`h-7 w-7 overflow-hidden rounded-full transition-all duration-200 ${
              active ? 'scale-110 ring-2 ring-white shadow-[0_0_14px_rgba(255,255,255,0.65)]' : available ? 'opacity-80 ring-1 ring-white/30 hover:scale-110 hover:opacity-100' : 'cursor-not-allowed opacity-35 grayscale ring-1 ring-white/20'
            }`}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}

import React from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { persistHarxLanguage } from '../../lib/i18n';
import { hardNavigate } from '../../lib/appNavigation';
import { normalizeSiteLang, type SiteLang } from '../../lib/langRoutes';
import { LANG_NAMES, MENU_LANGS, languageSwitchUrl, nextMenuIndex } from '../../lib/languageMenu';

/**
 * Sélecteur de langue du bandeau, identique à celui de la Téléphonie (v25_callcenter_front, LanguageMenu) : un globe et le nom de la langue
 * courante, un menu avec les quatre langues écrites dans leur propre langue. Aucun drapeau (une langue n'est pas un pays).
 * Accessible au clavier : Entrée / Espace / flèche bas ouvrent le menu, flèches haut et bas, Début, Fin pour se déplacer, Échap pour fermer.
 */
export function LanguageMenu({ className = '' }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const current: SiteLang = normalizeSiteLang(i18n.language);
  const [open, setOpen] = React.useState(false);
  const box = React.useRef<HTMLDivElement>(null);
  const button = React.useRef<HTMLButtonElement>(null);
  const items = React.useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = React.useId();
  const label = t('header.language', 'Language');

  React.useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // À l'ouverture, le focus va sur la langue courante.
  React.useEffect(() => {
    if (open) items.current[Math.max(0, MENU_LANGS.indexOf(current))]?.focus();
  }, [open, current]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  };

  const pick = (lang: SiteLang) => {
    close(true);
    if (lang === current) return;
    persistHarxLanguage(lang, { explicit: true });
    const url = languageSwitchUrl(window.location, lang);
    if (url) {
      // Page publique : une URL par langue (/fr/…, /en/…, /es/…, /ar/…), rechargement complet.
      hardNavigate(url);
      return;
    }
    void i18n.changeLanguage(lang);
  };

  const onButtonKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onMenuKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
      return;
    }
    if (e.key === 'Tab') {
      close(false);
      return;
    }
    const index = items.current.findIndex((el) => el === document.activeElement);
    const next = nextMenuIndex(e.key, index < 0 ? 0 : index, MENU_LANGS.length);
    if (next !== null) {
      e.preventDefault();
      items.current[next]?.focus();
    }
  };

  return (
    <div className={`relative ${className}`} ref={box} data-testid="language-menu">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${label} : ${LANG_NAMES[current]}`}
        title={label}
        data-testid="language-menu-button"
        className="flex h-9 items-center gap-1.5 rounded-full bg-black/20 px-3 text-sm font-bold text-white ring-1 ring-white/25 backdrop-blur-md transition-colors hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKey}
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span lang={current}>{LANG_NAMES[current]}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-white/80 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKey}
          className="absolute end-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-white/15 bg-[#0b1030] p-1 text-white shadow-2xl"
        >
          {MENU_LANGS.map((lang, i) => (
            <li key={lang} role="none">
              <button
                ref={(el) => {
                  items.current[i] = el;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={lang === current}
                tabIndex={-1}
                lang={lang}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                data-testid={`lang-menu-${lang}`}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-start text-sm font-bold hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
                onClick={() => pick(lang)}
              >
                <span className="flex-1">{LANG_NAMES[lang]}</span>
                {lang === current ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

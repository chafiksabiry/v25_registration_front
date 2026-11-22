import { isPrefixablePath, SITE_LANGS, stripLangPrefix, withLangPrefix, type SiteLang } from './langRoutes';

/** Langues du menu, dans le même ordre que le menu de la Téléphonie (v25_callcenter_front). */
export const MENU_LANGS: readonly SiteLang[] = SITE_LANGS;

/**
 * Noms des langues écrits dans leur propre langue (jamais traduits). Pas de drapeau : un drapeau désigne un pays, pas une langue
 * (le drapeau britannique exclut les États-Unis, l'espagnol est parlé dans une vingtaine de pays).
 */
export const LANG_NAMES: Record<SiteLang, string> = { fr: 'Français', en: 'English', es: 'Español', ar: 'العربية' };

/**
 * Adresse à ouvrir après un choix de langue sur une page publique : même page, préfixe /fr, /en, /es ou /ar remplacé, paramètres conservés.
 * null si la page n'existe pas en version préfixée (la langue change alors sans rechargement).
 */
export function languageSwitchUrl(loc: { pathname: string; search?: string; hash?: string }, lang: SiteLang): string | null {
  if (!isPrefixablePath(loc.pathname)) return null;
  return `${withLangPrefix(stripLangPrefix(loc.pathname), lang)}${loc.search ?? ''}${loc.hash ?? ''}`;
}

/** Déplacement du focus dans le menu au clavier (flèches, Début, Fin), en boucle. null pour une autre touche. */
export function nextMenuIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case 'ArrowDown':
      return (current + 1 + count) % count;
    case 'ArrowUp':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

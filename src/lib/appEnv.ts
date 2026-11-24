/**
 * Environnement de l'application (demande du fondateur du 24/11/2026 : « distinguer les comptes en recette des comptes en production »).
 *
 * Recette et production ont des bases séparées et une même personne peut exister dans les deux : hors production, l'interface porte
 * un repère visible (badge « RECETTE », titre d'onglet « [RECETTE] … »). En production, rien de nouveau ne s'affiche.
 *
 * Détection :
 * 1. Variable de build VITE_APP_ENV : absente ou « production » = production ; toute autre valeur (ex. « recette ») = hors production.
 * 2. Filet de sécurité, seulement quand la variable est absente : une adresse contenant « recette », « deploy-preview-- » ou
 *    « localhost » est traitée comme hors production. Une variable posée à « production » l'emporte toujours sur l'adresse.
 */
export const RECETTE_TITLE_PREFIX = '[RECETTE] ';

const NON_PRODUCTION_HOST_MARKERS = ['recette', 'deploy-preview--', 'localhost'];

export function isNonProduction(envValue?: string | null, hostname?: string | null): boolean {
  const value = (envValue ?? '').trim().toLowerCase();
  if (value) return value !== 'production';
  const host = (hostname ?? '').trim().toLowerCase();
  return NON_PRODUCTION_HOST_MARKERS.some((marker) => host.includes(marker));
}

export function currentHostname(): string {
  try {
    return typeof window === 'undefined' ? '' : window.location.hostname;
  } catch {
    return '';
  }
}

/** Hors production d'après la variable de build et, à défaut, l'adresse de la page. */
export function isRecette(
  env: { VITE_APP_ENV?: string } | undefined = import.meta.env,
  hostname: string = currentHostname(),
): boolean {
  return isNonProduction(env?.VITE_APP_ENV, hostname);
}

export function withRecettePrefix(title: string): string {
  return title.startsWith(RECETTE_TITLE_PREFIX) ? title : `${RECETTE_TITLE_PREFIX}${title}`;
}

/**
 * Préfixe « [RECETTE] » sur le titre de l'onglet, y compris après chaque changement de titre par une page (observation de <head>).
 * À n'appeler que hors production. Renvoie la fonction d'arrêt.
 */
export function installRecetteTitlePrefix(doc: Document = document): () => void {
  const apply = () => {
    const next = withRecettePrefix(doc.title);
    if (next !== doc.title) doc.title = next;
  };
  apply();
  if (typeof MutationObserver === 'undefined' || !doc.head) return () => {};
  const observer = new MutationObserver(apply);
  observer.observe(doc.head, { subtree: true, childList: true, characterData: true });
  return () => observer.disconnect();
}

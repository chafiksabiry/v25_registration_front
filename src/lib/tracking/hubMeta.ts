import type { SiteLang } from '../langRoutes';
const BASE_TITLE = 'HARX';

/** Accueil de l'ensemble HARX (hub des offres) — `/`. */
export const HUB_DESCRIPTION_FR =
  'HARX.ai réunit les offres HARX : TAAS (Transaction-as-a-Service, payez pour des résultats) et HARX Téléphonie (numéro de votre pays, appels entrants et sortants, accueil / secrétariat et IA).';
export const HUB_DESCRIPTION_EN =
  'HARX.ai brings together the HARX offers: TAAS (Transaction-as-a-Service, pay for results) and HARX Telephony (a number from your country, inbound and outbound calls, reception / secretarial and AI).';

export function hubPageTitle(lang: SiteLang = 'fr'): string {
  return lang !== 'fr' ? `${BASE_TITLE} — One platform, several offers` : `${BASE_TITLE} — Une plateforme, plusieurs offres`;
}

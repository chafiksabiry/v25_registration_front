import type { SiteLang } from '../langRoutes';
const BASE_TITLE = 'HARX';

/** Accueil de l'ensemble HARX (hub des offres) — `/`. */
export const HUB_DESCRIPTION_FR =
  "HARX.ai réunit trois offres propulsées par l'IA : TAAS (Transaction As A Service, des professionnels du service client payés au résultat), CLOUD (Telephony In The Cloud, la téléphonie d'entreprise dans le cloud) et NOMAD (Telephony for Digital Workers, un numéro utilisable partout dans le monde).";
export const HUB_DESCRIPTION_EN =
  'HARX.ai brings together three AI-powered offers: TAAS (Transaction As A Service, customer service professionals paid for results), CLOUD (Telephony In The Cloud, business telephony in the cloud) and NOMAD (Telephony for Digital Workers, a phone number that works anywhere in the world).';

/**
 * Titre d'onglet de l'accueil, aligné sur le titre de la page (« Tous vos appels, où que vous soyez »).
 * Séparateur « — » : updatePageHead normalise de toute façon « HARX – » en « HARX — ».
 */
const HUB_TITLES: Record<SiteLang, string> = {
  fr: 'Tous vos appels, où que vous soyez',
  en: 'All your calls, wherever you are',
  es: 'Todas sus llamadas, esté donde esté',
  ar: 'جميع مكالماتك، أينما كنت',
};

export function hubPageTitle(lang: SiteLang = 'fr'): string {
  return `${BASE_TITLE} — ${HUB_TITLES[lang] ?? HUB_TITLES.en}`;
}

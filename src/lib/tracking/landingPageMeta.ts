import { DEFAULT_PAGE_DESCRIPTION, HARX_SITE_URL } from './constants';
import type { PageMeta } from './pageMeta';

const BASE_TITLE = 'HARX';

export const LANDING_SECTION_IDS = ['top', 'how-it-works', 'pricing', 'clients', 'reps'] as const;

export type LandingSectionId = (typeof LANDING_SECTION_IDS)[number];

const LANDING_SECTION_TITLES: Record<LandingSectionId, string> = {
  top: 'Accueil',
  'how-it-works': 'Comment ça marche',
  pricing: 'Tarification',
  clients: 'Pour les entreprises',
  reps: 'Pour les reps',
};

export function landingSectionTitle(sectionId: string): string {
  return LANDING_SECTION_TITLES[sectionId as LandingSectionId] ?? LANDING_SECTION_TITLES.top;
}

const LANDING_SECTION_TITLES_EN: Record<LandingSectionId, string> = {
  top: 'Home',
  'how-it-works': 'How it works',
  pricing: 'Pricing',
  clients: 'For companies',
  reps: 'For reps',
};

export function landingPageTabTitle(sectionId: string, lang: 'fr' | 'en' = 'fr'): string {
  if (lang === 'en') {
    const label = LANDING_SECTION_TITLES_EN[sectionId as LandingSectionId] ?? LANDING_SECTION_TITLES_EN.top;
    return sectionId === 'top' ? `${BASE_TITLE} — ${label}` : `${BASE_TITLE} — Home · ${label}`;
  }
  const label = landingSectionTitle(sectionId);
  return sectionId === 'top' ? `${BASE_TITLE} — ${label}` : `${BASE_TITLE} — Accueil · ${label}`;
}

export function buildLandingSectionMeta(sectionId: string): PageMeta {
  const label = landingSectionTitle(sectionId);
  return {
    title: landingPageTabTitle(sectionId),
    description: DEFAULT_PAGE_DESCRIPTION,
    canonical: `${HARX_SITE_URL}/`,
  };
}

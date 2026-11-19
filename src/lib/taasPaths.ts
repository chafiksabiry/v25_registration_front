/** Pages de l'offre TAAS : accueil, espace COMPANY (publier un gig) et espace REPS (trouver des gigs). */
export const TAAS_HOME = '/taas';
export const TAAS_COMPANY = '/taas/company';
export const TAAS_REPS = '/taas/reps';

/** Page qui contient une section (ancres du bandeau, du pied de page et des redirections après inscription). */
export function taasPathForSection(sectionId: string | null | undefined): string {
  if (!sectionId) return TAAS_HOME;
  if (sectionId === 'reps' || sectionId === 'featured-gigs') return TAAS_REPS;
  if (sectionId === 'how-it-works' || sectionId === 'pricing' || sectionId === 'clients' || sectionId === 'budget') return TAAS_COMPANY;
  return TAAS_HOME;
}

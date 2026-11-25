import { isNomadRegisterPath, CALL_CENTER_REGISTER_PATH } from './offerRegister';
import { isCloudReceptionistAccountPath } from './cloudReceptionist';
import { stripLangPrefix } from './langRoutes';
import type { TelephonyPlan } from './product';

/**
 * Parcours d'entrée envoyé avec l'inscription (POST /auth/register, champ `signup`) : l'offre et le produit du parcours où la personne
 * s'inscrit, d'après l'adresse (et, sur l'ancienne adresse Téléphonie partagée, l'offre mémorisée par l'application). Le serveur ne
 * garde que des valeurs de listes fermées et l'adresse impose son offre (v25_registration_backend, src/utils/signupJourney.js).
 * Rien n'est affiché : la donnée sert au suivi des parcours dans l'administration.
 */
export type SignupOffer = 'nomad' | 'cloud' | 'taas';
export type SignupProduct = 'receptionist' | 'entreprise' | 'contact_centre';
export type SignupJourney = { offer: SignupOffer | null; product: SignupProduct | null; entry: string; lang: string | null };

const PLAN_JOURNEY: Record<TelephonyPlan, { offer: SignupOffer; product: SignupProduct | null }> = {
  nomad_solo: { offer: 'nomad', product: null },
  accueil: { offer: 'cloud', product: 'receptionist' },
  full_scope: { offer: 'cloud', product: 'entreprise' },
  multi_clients: { offer: 'cloud', product: 'contact_centre' },
};

export function signupJourneyFor({
  pathname,
  plan,
  nomadVisitor,
  lang,
}: {
  pathname: string;
  plan: TelephonyPlan | null;
  nomadVisitor: boolean;
  lang?: string | null;
}): SignupJourney {
  const entry = stripLangPrefix(pathname).replace(/\/+$/, '') || '/';
  const base = { entry, lang: lang ? lang.slice(0, 2).toLowerCase() : null };
  if (isNomadRegisterPath(entry)) return { ...base, offer: 'nomad', product: null };
  if (isCloudReceptionistAccountPath(entry)) return { ...base, offer: 'cloud', product: 'receptionist' };
  if (entry === '/auth/register-company') return { ...base, offer: 'taas', product: null };
  if (entry === '/auth/register-rep') return { ...base, offer: null, product: null };
  if (entry === CALL_CENTER_REGISTER_PATH) {
    // Ancienne inscription Téléphonie : NOMAD pour un visiteur du parcours Nomad, sinon CLOUD (produit de l'offre mémorisée).
    if (nomadVisitor) return { ...base, offer: 'nomad', product: null };
    const fromPlan = plan ? PLAN_JOURNEY[plan] : null;
    return { ...base, offer: 'cloud', product: fromPlan?.offer === 'cloud' ? fromPlan.product : null };
  }
  const fromPlan = plan ? PLAN_JOURNEY[plan] : null;
  return { ...base, offer: fromPlan?.offer ?? null, product: fromPlan?.product ?? null };
}

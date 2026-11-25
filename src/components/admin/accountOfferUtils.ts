/**
 * Offre réelle d'un compte, lue par le serveur (`accountOffer` des réponses /admin/users et /admin/users/:id).
 * Le type historique (`typeUser: 'call-center'`, `product: 'callcentre'`) est commun à toute inscription téléphonie :
 * il ne dit pas l'offre et n'est plus affiché comme tel (seulement en « détail technique » sur la fiche).
 * Noms figés (NON-REGRESSION) : NOMAD, CLOUD ; produits Receptionist, Entreprise, Contact Centre. Jamais traduits.
 */
export type AccountOfferId = 'nomad' | 'cloud';
export type CloudProductId = 'receptionist' | 'entreprise' | 'contact_centre';

export type AccountOffer = {
  offer: AccountOfferId | null;
  product?: CloudProductId | string | null;
  source?: 'subscription' | 'accountProfile' | null;
};

export const OFFER_NAMES: Record<AccountOfferId, string> = { nomad: 'NOMAD', cloud: 'CLOUD' };

export const CLOUD_PRODUCT_NAMES: Record<CloudProductId, string> = {
  receptionist: 'Receptionist',
  entreprise: 'Entreprise',
  contact_centre: 'Contact Centre',
};

export const UNKNOWN_OFFER_LABEL = 'Offre inconnue';

export type OfferFilter = 'all' | AccountOfferId | 'unknown';

export const OFFER_FILTERS: { value: OfferFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'nomad', label: OFFER_NAMES.nomad },
  { value: 'cloud', label: OFFER_NAMES.cloud },
  { value: 'unknown', label: UNKNOWN_OFFER_LABEL },
];

export function normalizeAccountOffer(value: AccountOffer | null | undefined): AccountOffer {
  const offer = value?.offer === 'nomad' || value?.offer === 'cloud' ? value.offer : null;
  return { offer, product: offer === 'cloud' ? value?.product || null : null, source: value?.source || null };
}

/** Nom du produit CLOUD (Receptionist / Entreprise / Contact Centre) ; null si absent ou inconnu. */
export function cloudProductName(product: string | null | undefined): string | null {
  if (!product) return null;
  return (CLOUD_PRODUCT_NAMES as Record<string, string>)[product] || null;
}

/** Libellé texte : « NOMAD », « CLOUD · Receptionist », « CLOUD » (produit inconnu) ou « Offre inconnue ». */
export function accountOfferLabel(value: AccountOffer | null | undefined): string {
  const { offer, product } = normalizeAccountOffer(value);
  if (!offer) return UNKNOWN_OFFER_LABEL;
  const name = offer === 'cloud' ? cloudProductName(product) : null;
  return name ? `${OFFER_NAMES[offer]} · ${name}` : OFFER_NAMES[offer];
}

/** Détail technique (type historique du compte), affiché discrètement sur la fiche. null s'il n'y a rien à dire. */
export function legacyTypeDetail(typeUser?: string | null, product?: string | null): string | null {
  const parts = [typeUser ? `type ${typeUser}` : null, product ? `produit ${product}` : null].filter(Boolean);
  return parts.length ? `Détail technique : ${parts.join(', ')}` : null;
}

/** Types historiques qui ont leur propre sens (HARX v1, administrateur) : gardés tels quels si l'offre est inconnue. */
const OWN_MEANING_TYPES = ['admin', 'rep', 'company'];

/**
 * Afficher l'offre (plutôt que le type historique) ? Oui si l'offre est connue (sauf compte admin), ou pour un compte
 * téléphonie (`call-center`, sans type) : « Offre inconnue » remplace alors « CALL-CENTER ».
 */
export function showsAccountOffer(typeUser: string | null | undefined, value: AccountOffer | null | undefined): boolean {
  if (typeUser === 'admin') return false;
  if (normalizeAccountOffer(value).offer) return true;
  return !OWN_MEANING_TYPES.includes(String(typeUser || ''));
}

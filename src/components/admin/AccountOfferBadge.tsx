import React from 'react';
import { OfferWordmark } from '../Hub/OfferWordmark';
import {
  OFFER_NAMES,
  UNKNOWN_OFFER_LABEL,
  cloudProductName,
  normalizeAccountOffer,
  type AccountOffer,
} from './accountOfferUtils';

/**
 * Offre du compte : logo de l'offre (OfferWordmark, NOMAD / CLOUD) + produit CLOUD, ou « Offre inconnue ».
 * `size="sm"` dans la liste, `size="md"` dans l'en-tête de la fiche.
 */
export function AccountOfferBadge({ value, size = 'sm' }: { value: AccountOffer | null | undefined; size?: 'sm' | 'md' }) {
  const { offer, product } = normalizeAccountOffer(value);
  if (!offer) {
    return (
      <span className="text-slate-500 normal-case" data-testid="account-offer" data-offer="unknown">
        {UNKNOWN_OFFER_LABEL}
      </span>
    );
  }
  const productName = offer === 'cloud' ? cloudProductName(product) : null;
  const logo = size === 'md' ? '[&_svg]:h-3.5' : '[&_svg]:h-3';
  return (
    <span className="inline-flex items-center gap-1.5 normal-case" data-testid="account-offer" data-offer={offer}>
      <span className={`inline-flex ${logo} [&_svg]:w-auto [&_svg]:max-w-none [&_svg]:overflow-visible`}>
        <OfferWordmark offer={offer} label={OFFER_NAMES[offer]} />
      </span>
      {productName ? <span className="font-semibold">{productName}</span> : null}
    </span>
  );
}

export default AccountOfferBadge;

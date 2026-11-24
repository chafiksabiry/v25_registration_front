import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AccountOfferBadge from './AccountOfferBadge';
import NomadProfileCard from './NomadProfileCard';
import { ProfileHero } from './AdminProfileViews';
import {
  OFFER_FILTERS,
  accountOfferLabel,
  legacyTypeDetail,
  showsAccountOffer,
} from './accountOfferUtils';

const badge = (value: Parameters<typeof AccountOfferBadge>[0]['value']) =>
  renderToStaticMarkup(React.createElement(AccountOfferBadge, { value }));

describe('offre réelle du compte (admin)', () => {
  it('libellés : NOMAD, CLOUD + produit, CLOUD seul, Offre inconnue', () => {
    expect(accountOfferLabel({ offer: 'nomad' })).toBe('NOMAD');
    expect(accountOfferLabel({ offer: 'cloud', product: 'receptionist' })).toBe('CLOUD · Receptionist');
    expect(accountOfferLabel({ offer: 'cloud', product: 'entreprise' })).toBe('CLOUD · Entreprise');
    expect(accountOfferLabel({ offer: 'cloud', product: 'contact_centre' })).toBe('CLOUD · Contact Centre');
    expect(accountOfferLabel({ offer: 'cloud', product: null })).toBe('CLOUD');
    expect(accountOfferLabel({ offer: 'nomad', product: 'receptionist' })).toBe('NOMAD');
    expect(accountOfferLabel({ offer: null })).toBe('Offre inconnue');
    expect(accountOfferLabel(undefined)).toBe('Offre inconnue');
  });

  it('badge NOMAD : logo OfferWordmark, sans produit ni « call-center »', () => {
    const html = badge({ offer: 'nomad', product: null, source: 'accountProfile' });
    expect(html).toContain('data-offer="nomad"');
    expect(html).toContain('<span class="sr-only">NOMAD</span>');
    expect(html).toMatch(/<svg[^>]*class="hub-wordmark"/);
    expect(html.toLowerCase()).not.toContain('call');
  });

  it('badge CLOUD : logo + nom figé du produit', () => {
    for (const [product, name] of [
      ['receptionist', 'Receptionist'],
      ['entreprise', 'Entreprise'],
      ['contact_centre', 'Contact Centre'],
    ] as const) {
      const html = badge({ offer: 'cloud', product });
      expect(html).toContain('data-offer="cloud"');
      expect(html).toContain('<span class="sr-only">CLOUD</span>');
      expect(html).toContain(`>${name}</span>`);
    }
  });

  it('badge inconnu : « Offre inconnue », sans logo', () => {
    const html = badge({ offer: null });
    expect(html).toContain('Offre inconnue');
    expect(html).not.toContain('<svg');
  });

  it('en-tête de fiche : l’offre remplace la pastille du type historique', () => {
    const html = renderToStaticMarkup(
      React.createElement(ProfileHero, {
        fullName: 'Compte test',
        email: 'test@example.com',
        typeUser: 'call-center',
        offerBadge: React.createElement(AccountOfferBadge, { value: { offer: 'nomad' }, size: 'md' }),
      }),
    );
    expect(html).toContain('data-testid="hero-offer"');
    expect(html).toContain('<span class="sr-only">NOMAD</span>');
    expect(html).not.toContain('call-center');
    // Sans offre fournie : comportement inchangé.
    const legacy = renderToStaticMarkup(React.createElement(ProfileHero, { fullName: 'X', email: 'x@y.z', typeUser: 'rep' }));
    expect(legacy).toContain('>rep</span>');
  });

  it('quand afficher l’offre : compte téléphonie toujours, rep/company/admin seulement si l’offre est connue (jamais admin)', () => {
    expect(showsAccountOffer('call-center', { offer: 'nomad' })).toBe(true);
    expect(showsAccountOffer('call-center', { offer: null })).toBe(true);
    expect(showsAccountOffer(null, undefined)).toBe(true);
    expect(showsAccountOffer('company', { offer: 'cloud', product: 'entreprise' })).toBe(true);
    expect(showsAccountOffer('company', { offer: null })).toBe(false);
    expect(showsAccountOffer('rep', undefined)).toBe(false);
    expect(showsAccountOffer('admin', { offer: 'nomad' })).toBe(false);
  });

  it('détail technique discret et filtre « offre »', () => {
    expect(legacyTypeDetail('call-center', 'callcentre')).toBe('Détail technique : type call-center, produit callcentre');
    expect(legacyTypeDetail(null, null)).toBeNull();
    expect(OFFER_FILTERS.map((f) => f.value)).toEqual(['all', 'nomad', 'cloud', 'unknown']);
    expect(OFFER_FILTERS.map((f) => f.label)).toEqual(['Toutes', 'NOMAD', 'CLOUD', 'Offre inconnue']);
  });

  it('carte Profil NOMAD : logo NOMAD et informations du profil', () => {
    const html = renderToStaticMarkup(
      React.createElement(NomadProfileCard, {
        profile: { companyId: 'c1', accountProfile: 'solo', name: 'Amine', phone: '+33600000000', country: 'FR' },
      }),
    );
    expect(html).toContain('data-testid="nomad-profile"');
    expect(html).toContain('<span class="sr-only">NOMAD</span>');
    expect(html).toContain('Amine');
    expect(html).toContain('+33600000000');
    expect(html).not.toContain('Aucun profil');
  });
});

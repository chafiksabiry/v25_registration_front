import { describe, expect, it } from 'vitest';
import { signupJourneyFor } from './signupJourney';

describe('parcours d’entrée envoyé avec l’inscription', () => {
  it('adresse NOMAD : NOMAD, quelle que soit l’offre mémorisée', () => {
    expect(signupJourneyFor({ pathname: '/nomad/inscription', plan: 'accueil', nomadVisitor: true, lang: 'fr-FR' })).toEqual({
      offer: 'nomad', product: null, entry: '/nomad/inscription', lang: 'fr',
    });
    expect(signupJourneyFor({ pathname: '/en/auth/register-nomad/', plan: null, nomadVisitor: true }).offer).toBe('nomad');
  });

  it('adresse CLOUD Receptionist : CLOUD + Receptionist', () => {
    expect(signupJourneyFor({ pathname: '/cloud/receptionist/inscription/compte', plan: 'nomad_solo', nomadVisitor: false, lang: 'en' })).toEqual({
      offer: 'cloud', product: 'receptionist', entry: '/cloud/receptionist/inscription/compte', lang: 'en',
    });
  });

  it('ancienne adresse Téléphonie : NOMAD pour un visiteur Nomad, sinon CLOUD et le produit de l’offre mémorisée', () => {
    expect(signupJourneyFor({ pathname: '/auth/register-call-center', plan: null, nomadVisitor: true }).offer).toBe('nomad');
    expect(signupJourneyFor({ pathname: '/fr/auth/register-call-center', plan: 'full_scope', nomadVisitor: false })).toMatchObject({ offer: 'cloud', product: 'entreprise', entry: '/auth/register-call-center' });
    expect(signupJourneyFor({ pathname: '/auth/register-call-center', plan: 'multi_clients', nomadVisitor: false }).product).toBe('contact_centre');
    expect(signupJourneyFor({ pathname: '/auth/register-call-center', plan: null, nomadVisitor: false })).toMatchObject({ offer: 'cloud', product: null });
  });

  it('TAAS, agent et inscription générale', () => {
    expect(signupJourneyFor({ pathname: '/auth/register-company', plan: null, nomadVisitor: false }).offer).toBe('taas');
    expect(signupJourneyFor({ pathname: '/auth/register-rep', plan: 'accueil', nomadVisitor: false }).offer).toBeNull();
    expect(signupJourneyFor({ pathname: '/auth/register', plan: null, nomadVisitor: false })).toMatchObject({ offer: null, product: null, lang: null });
    expect(signupJourneyFor({ pathname: '/auth/register', plan: 'accueil', nomadVisitor: false })).toMatchObject({ offer: 'cloud', product: 'receptionist' });
  });
});

import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SignupJourneyCard from './SignupJourneyCard';
import {
  JOURNEY_FILTERS,
  UNRECORDED_LABEL,
  formatJourneyDuration,
  journeyRowLabel,
  type SignupJourneySummary,
} from './signupJourneyUtils';

const IDS = ['account_created', 'email_verified', 'phone_verified', 'identity_submitted', 'identity_verified', 'offer_chosen', 'trial_call', 'number_chosen', 'payment_succeeded', 'onboarding_finished', 'first_login_app'];
const at = (min: number) => new Date(Date.UTC(2026, 10, 25, 9, min)).toISOString();

function summary(reached: Record<string, number>, extra: Partial<SignupJourneySummary> = {}): SignupJourneySummary {
  return {
    recorded: true,
    signup: { offer: 'nomad', product: null, entry: '/nomad/inscription', lang: 'fr', country: 'FR', at: at(0) },
    steps: IDS.map((id) => ({ id, reached: id in reached, at: id in reached ? at(reached[id]) : null, ...(id === 'trial_call' && id in reached ? { outcome: 'done' as const } : {}) })),
    lastReached: Object.keys(reached).at(-1) || null,
    finished: 'onboarding_finished' in reached,
    totalMs: 'onboarding_finished' in reached ? reached.onboarding_finished * 60000 : null,
    status: 'onboarding_finished' in reached ? 'finished' : 'in_progress',
    ...extra,
  };
}

const card = (journey: SignupJourneySummary | null | undefined) => renderToStaticMarkup(React.createElement(SignupJourneyCard, { journey }));

describe('carte « Parcours d’inscription » (admin)', () => {
  it('NOMAD en cours : logo NOMAD, adresse d’entrée, étapes atteintes / non atteintes, bloqué à la dernière étape', () => {
    const html = card(summary({ account_created: 0, email_verified: 3, trial_call: 20 }));
    expect(html).toContain('Parcours d’inscription');
    expect(html).toContain('data-offer="nomad"');
    expect(html).toContain('<span class="sr-only">NOMAD</span>');
    expect(html).toMatch(/<svg[^>]*class="hub-wordmark"/);
    expect(html).toContain('/nomad/inscription');
    expect(html).toContain('data-step="email_verified" data-reached="true"');
    expect(html).toContain('data-step="payment_succeeded" data-reached="false"');
    expect(html).toContain('Appel d’essai (passé)');
    expect(html).toContain('Bloqué à Appel d’essai');
    expect(html).toContain('Non atteinte');
    expect((html.match(/data-step=/g) || []).length).toBe(IDS.length);
  });

  it('CLOUD Receptionist terminé : logo CLOUD + produit, durée totale', () => {
    const html = card(summary({ account_created: 0, email_verified: 2, onboarding_finished: 125 }, { signup: { offer: 'cloud', product: 'receptionist', entry: '/cloud/receptionist/inscription/compte' } }));
    expect(html).toContain('data-status="finished"');
    expect(html).toContain('<span class="sr-only">CLOUD</span>');
    expect(html).toContain('>Receptionist</span>');
    expect(html).toContain('Terminé');
    expect(html).toContain('2 h 05');
  });

  it('compte antérieur : « Parcours non enregistré (compte antérieur) », sans étapes', () => {
    for (const j of [null, undefined, { ...summary({}), recorded: false, status: 'unrecorded' as const, signup: null }]) {
      const html = card(j);
      expect(html).toContain(UNRECORDED_LABEL);
      expect(html).not.toContain('data-step=');
    }
  });

  it('liste : libellé du parcours et filtre', () => {
    expect(journeyRowLabel({ status: 'finished', lastReached: 'onboarding_finished' })).toBe('Parcours : terminé');
    expect(journeyRowLabel({ status: 'in_progress', lastReached: 'offer_chosen' })).toBe('Parcours : bloqué à Offre choisie');
    expect(journeyRowLabel({ status: 'unrecorded', lastReached: null })).toBeNull();
    expect(journeyRowLabel(undefined)).toBeNull();
    const values = JOURNEY_FILTERS.map((f) => f.value);
    expect(values).toContain('finished');
    expect(values).toContain('stuck:payment_succeeded');
    expect(values).toContain('unrecorded');
    expect(values).not.toContain('stuck:onboarding_finished');
  });

  it('durées', () => {
    expect(formatJourneyDuration(45 * 60000)).toBe('45 min');
    expect(formatJourneyDuration(76 * 3600000)).toBe('3 j 4 h');
    expect(formatJourneyDuration(null)).toBe('—');
  });
});

import React from 'react';
import { OfferWordmark } from '../Hub/OfferWordmark';
import { InfoCard, formatDate } from './adminUiUtils';
import { CLOUD_PRODUCT_NAMES } from './accountOfferUtils';
import {
  TRIAL_OUTCOME_LABELS,
  UNRECORDED_LABEL,
  formatJourneyDuration,
  journeyStepLabel,
  type SignupJourneySummary,
} from './signupJourneyUtils';

const OFFER_LABELS = { nomad: 'NOMAD', cloud: 'CLOUD', taas: 'TAAS' } as const;

/** Offre d'entrée : logo de l'offre (OfferWordmark, jamais le nom en texte) + produit CLOUD. */
function EntryOffer({ signup }: { signup: NonNullable<SignupJourneySummary['signup']> }) {
  if (!signup.offer) return <span className="text-slate-500">Offre non précisée</span>;
  const product = signup.offer === 'cloud' && signup.product ? CLOUD_PRODUCT_NAMES[signup.product] : null;
  return (
    <span className="inline-flex items-center gap-1.5" data-testid="journey-entry-offer" data-offer={signup.offer}>
      <span className="inline-flex [&_svg]:h-3.5 [&_svg]:w-auto [&_svg]:max-w-none [&_svg]:overflow-visible">
        <OfferWordmark offer={signup.offer} label={OFFER_LABELS[signup.offer]} />
      </span>
      {product ? <span className="font-semibold">{product}</span> : null}
    </span>
  );
}

/**
 * Carte « Parcours d'inscription » de la fiche utilisateur : offre et adresse d'entrée, étapes datées (atteinte / non atteinte),
 * durée totale. Compte créé avant le suivi : « Parcours non enregistré (compte antérieur) ».
 */
export default function SignupJourneyCard({ journey }: { journey: SignupJourneySummary | null | undefined }) {
  const recorded = Boolean(journey?.recorded);
  return (
    <section className="admin-section space-y-4" data-testid="signup-journey" data-status={journey?.status || 'unrecorded'}>
      <div className="pl-3">
        <h2 className="admin-section-title">Parcours d’inscription</h2>
        <p className="admin-section-desc">Offre d’entrée et étapes datées, enregistrées par le serveur au fil du parcours.</p>
      </div>
      {!recorded || !journey ? (
        <p className="pl-3 text-sm text-slate-500" data-testid="journey-unrecorded">{UNRECORDED_LABEL}</p>
      ) : (
        <>
          <div className="pl-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <InfoCard label="Offre d’entrée" value={journey.signup ? <EntryOffer signup={journey.signup} /> : '—'} />
            <InfoCard label="Adresse d’entrée" value={<span className="font-mono text-xs break-all">{journey.signup?.entry || '—'}</span>} />
            <InfoCard
              label="Statut"
              value={journey.finished ? 'Terminé' : `Bloqué à ${journeyStepLabel(journey.lastReached)}`}
            />
            <InfoCard label="Durée totale" value={journey.finished ? formatJourneyDuration(journey.totalMs) : '—'} />
          </div>
          <ol className="pl-3 space-y-2" data-testid="journey-steps">
            {journey.steps.map((step) => (
              <li
                key={step.id}
                className="flex items-center gap-3 text-sm"
                data-step={step.id}
                data-reached={step.reached ? 'true' : 'false'}
              >
                <span
                  aria-hidden="true"
                  className={`inline-block h-2.5 w-2.5 rounded-full ${step.reached ? 'bg-emerald-500' : 'bg-slate-300'}`}
                />
                <span className={step.reached ? 'text-slate-900 font-medium' : 'text-slate-400'}>
                  {journeyStepLabel(step.id)}
                  {step.outcome ? ` (${TRIAL_OUTCOME_LABELS[step.outcome]})` : ''}
                </span>
                <span className={`ml-auto text-xs ${step.reached ? 'text-slate-600' : 'text-slate-400'}`}>
                  {step.reached ? formatDate(step.at) : 'Non atteinte'}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

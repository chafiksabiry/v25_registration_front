import React from 'react';
import { FeaturedGigs } from '../LandingPage/FeaturedGigs';
import { Pricing } from '../LandingPage/Pricing';
import { RepsBenefits, RepsHero } from '../LandingPage/ForReps';
import { RepsStartSection } from '../LandingPage/TaasWidgets';
import { TaasFinalCta } from './TaasFinalCta';
import { Aurora } from './Aurora';

/**
 * Espace REPS, dans l'ordre du raisonnement d'un candidat :
 * ce que je gagne (rémunération) → pourquoi HARX (atouts) → ce que je peux faire (missions) → comment démarrer et combien je peux gagner
 * → quel forfait → un seul appel final.
 */
export function TaasRepsPage({ onJoin }: { onGetStarted?: () => void; onJoin: () => void }) {
  return (
    <>
      <RepsHero onJoin={onJoin} />
      <RepsBenefits />
      <FeaturedGigs onJoin={onJoin} />
      <RepsStartSection />
      <section id="pricing" className="relative scroll-mt-28 overflow-hidden bg-[#070711] px-4 py-16 text-white" data-testid="reps-pricing">
        <Aurora tone="reps" />
        <div className="relative">
          <Pricing onGetStarted={onJoin} only="rep" />
        </div>
      </section>
      <TaasFinalCta kind="reps" onJoin={onJoin} />
    </>
  );
}

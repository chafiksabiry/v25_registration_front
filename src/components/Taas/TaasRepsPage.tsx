import React from 'react';
import { FeaturedGigs } from '../LandingPage/FeaturedGigs';
import { Pricing } from '../LandingPage/Pricing';
import { RepsBenefits, RepsHero } from '../LandingPage/ForReps';
import { RepsJoinSection } from '../LandingPage/TaasWidgets';
import { Aurora } from './Aurora';

/** Espace REPS : promesse et rémunération en tête, atouts, missions types, forfaits REPS, démarrage en trois étapes, gains, adhésion. */
export function TaasRepsPage({ onGetStarted, onJoin }: { onGetStarted: () => void; onJoin: () => void }) {
  return (
    <>
      <RepsHero onJoin={onJoin} />
      <RepsBenefits />
      <FeaturedGigs onJoin={onJoin} />
      <section id="pricing" className="relative scroll-mt-28 overflow-hidden bg-[#0a0a18] px-4 py-16 text-white" data-testid="reps-pricing">
        <Aurora tone="reps" />
        <div className="relative">
          <Pricing onGetStarted={onGetStarted} only="rep" />
        </div>
      </section>
      <section id="reps" className="scroll-mt-28">
        <RepsJoinSection onJoin={onJoin} />
      </section>
    </>
  );
}

import React from 'react';
import { FeaturedGigs } from '../LandingPage/FeaturedGigs';
import { RepsBenefits, RepsHero } from '../LandingPage/ForReps';
import { RepsJoinSection } from '../LandingPage/TaasWidgets';

/** Espace REPS : promesse et rémunération en tête, atouts, missions types, démarrage en trois étapes, gains, adhésion. */
export function TaasRepsPage({ onJoin }: { onGetStarted?: () => void; onJoin: () => void }) {
  return (
    <>
      <RepsHero onJoin={onJoin} />
      <RepsBenefits />
      <FeaturedGigs onJoin={onJoin} />
      <section id="reps" className="scroll-mt-28">
        <RepsJoinSection onJoin={onJoin} />
      </section>
    </>
  );
}

import React from 'react';
import { FeaturedGigs } from '../LandingPage/FeaturedGigs';
import { ForReps } from '../LandingPage/ForReps';
import { RepsJoinSection } from '../LandingPage/TaasWidgets';
import { TaasBanner } from './TaasBanner';

/** Espace REPS : missions types, démarrage en trois étapes, estimation de gains, adhésion. */
export function TaasRepsPage({ onGetStarted, onJoin }: { onGetStarted: () => void; onJoin: () => void }) {
  return (
    <>
      <TaasBanner kind="reps" onJoin={onJoin} />
      <FeaturedGigs onJoin={onJoin} />
      <RepsJoinSection onJoin={onJoin} />
      <section id="reps" className="scroll-mt-28 bg-white text-slate-900">
        <ForReps onGetStarted={onGetStarted} />
      </section>
    </>
  );
}

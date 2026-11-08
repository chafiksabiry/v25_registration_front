import React from 'react';
import { HowItWorks } from '../LandingPage/HowItWorks';
import { Pricing } from '../LandingPage/Pricing';
import { ForClients } from '../LandingPage/ForClients';
import { TaasBanner } from './TaasBanner';
import { Aurora } from './Aurora';

/** Espace COMPANY : même langage visuel que l'accueil HARX (fond quasi noir, halos, cartes en verre). */
export function TaasCompanyPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <>
      <TaasBanner kind="company" />
      <section id="how-it-works" className="relative scroll-mt-28 overflow-hidden bg-[#070711] text-white">
        <Aurora tone="company" />
        <div className="relative">
          <HowItWorks onGetStarted={onGetStarted} />
        </div>
      </section>
      <section id="pricing" className="relative scroll-mt-28 overflow-hidden bg-[#0a0a18] px-4 py-16 text-white" data-testid="pricing-band">
        <Aurora tone="pricing" />
        <div className="relative">
          <Pricing onGetStarted={onGetStarted} />
        </div>
      </section>
      <section id="clients" className="relative scroll-mt-28 overflow-hidden bg-[#070711] text-white">
        <Aurora tone="company" />
        <div className="relative">
          <ForClients onGetStarted={onGetStarted} />
        </div>
      </section>
    </>
  );
}

import React from 'react';
import { HowItWorks } from '../LandingPage/HowItWorks';
import { Pricing } from '../LandingPage/Pricing';
import { ForClients } from '../LandingPage/ForClients';
import { BudgetSimulator } from '../LandingPage/TaasWidgets';
import { TaasBanner } from './TaasBanner';

/** Espace COMPANY : comment ça marche, simulateur de budget, forfaits, cas d'usage. */
export function TaasCompanyPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <>
      <TaasBanner kind="company" />
      <section id="how-it-works" className="scroll-mt-28 bg-white text-slate-900">
        <HowItWorks onGetStarted={onGetStarted} />
      </section>
      <BudgetSimulator />
      <section id="pricing" className="scroll-mt-28 bg-white text-slate-900">
        <Pricing onGetStarted={onGetStarted} />
      </section>
      <section id="clients" className="scroll-mt-28 bg-white text-slate-900">
        <ForClients onGetStarted={onGetStarted} />
      </section>
    </>
  );
}

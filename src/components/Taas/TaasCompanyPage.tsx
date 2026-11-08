import React from 'react';
import { HowItWorks } from '../LandingPage/HowItWorks';
import { Pricing } from '../LandingPage/Pricing';
import { ForClients } from '../LandingPage/ForClients';
import { TaasBanner } from './TaasBanner';

/** Espace COMPANY : bandeau d'accroche, comment ça marche, forfaits mis en avant, cas d'usage. */
export function TaasCompanyPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <>
      <TaasBanner kind="company" />
      <section id="how-it-works" className="scroll-mt-28 bg-gradient-to-b from-white via-harx-50/40 to-white text-slate-900">
        <HowItWorks onGetStarted={onGetStarted} />
      </section>
      {/* Forfaits : bande sombre colorée, carte surélevée */}
      <section id="pricing" className="relative scroll-mt-28 overflow-hidden bg-gradient-to-br from-slate-950 via-harx-900 to-harx-alt-900 px-4 py-16 text-slate-900" data-testid="pricing-band">
        <div className="pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-harx-500/25 blur-[110px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-harx-alt-500/25 blur-[110px]" aria-hidden="true" />
        <div className="relative">
          <Pricing onGetStarted={onGetStarted} />
        </div>
      </section>
      <section id="clients" className="scroll-mt-28 bg-gradient-to-b from-white to-harx-50/60 text-slate-900">
        <ForClients onGetStarted={onGetStarted} />
      </section>
    </>
  );
}

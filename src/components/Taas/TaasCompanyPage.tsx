import React from 'react';
import { HowItWorks } from '../LandingPage/HowItWorks';
import { Pricing } from '../LandingPage/Pricing';
import { ForClients } from '../LandingPage/ForClients';
import { CompanyHero } from './CompanyHero';
import { UseCaseMarquee } from './UseCaseMarquee';
import { TaasFinalCta } from './TaasFinalCta';
import { Aurora } from './Aurora';

/**
 * Espace COMPANY, dans l'ordre du raisonnement d'un acheteur :
 * la promesse → ce qu'on peut confier (cas d'usage) → comment ça marche → combien ça coûte (forfaits) → un seul appel final.
 */
export function TaasCompanyPage({ onGetStarted: _onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <>
      <CompanyHero />
      <UseCaseMarquee />
      <section id="clients" className="relative scroll-mt-28 overflow-hidden bg-[#070711] text-white">
        <Aurora tone="company" />
        <div className="relative">
          <ForClients />
        </div>
      </section>
      <section id="how-it-works" className="relative scroll-mt-28 overflow-hidden bg-[#0a0a18] text-white">
        <Aurora tone="pricing" />
        <div className="relative">
          <HowItWorks />
        </div>
      </section>
      <section id="pricing" className="relative scroll-mt-28 overflow-hidden bg-[#070711] px-4 py-16 text-white" data-testid="pricing-band">
        <Aurora tone="company" />
        <div className="relative">
          <Pricing onGetStarted={() => undefined} only="company" />
        </div>
      </section>
      <TaasFinalCta kind="company" />
    </>
  );
}

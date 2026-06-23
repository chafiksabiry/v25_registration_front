import React, { useState } from 'react';
import { ArrowRight, Building2, Headphones, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { StripePricingTableEmbed } from './StripePricingTableEmbed';
import { COMPANY_PRICING_TABLE_ID, REP_PRICING_TABLE_ID } from './stripePricingConfig';

interface PricingProps {
  onGetStarted: () => void;
}

type PricingAudience = 'company' | 'rep';

export function Pricing({ onGetStarted }: PricingProps) {
  const [audience, setAudience] = useState<PricingAudience>('company');

  const bookDemo = () => {
    window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="relative overflow-hidden bg-gradient-to-b from-harx-50 via-white to-harx-alt-50 py-16 md:py-24">
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-harx-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-harx-alt-300/20 blur-3xl" />

        <div className="container relative mx-auto px-4">
          <div className="mx-auto mb-8 max-w-4xl text-center">
            <div className="rounded-2xl bg-gradient-to-r from-harx-600 to-harx-alt-500 p-5 shadow-xl md:p-6">
              <div className="mb-2 flex items-center justify-center gap-2 text-white">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
                <h2 className="text-xl font-bold md:text-2xl">Limited Time Offer</h2>
                <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <p className="text-lg text-white md:text-xl">
                Get 50% off company plans when you subscribe today!
              </p>
              <p className="mt-2 text-sm text-harx-100">*Offer valid for the first 3 months</p>
            </div>
          </div>

          <div className="mx-auto mb-10 max-w-4xl text-center">
            <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
              Subscription Plans
            </h1>
            <p className="text-base text-slate-600 md:text-xl">
              Prices synced with Stripe — choose your path below.
            </p>

            <div className="mt-6 inline-flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setAudience('company')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all md:px-6 md:text-base ${
                  audience === 'company'
                    ? 'bg-gradient-to-r from-harx-500 to-harx-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Company · Post a Gig
              </button>
              <button
                type="button"
                onClick={() => setAudience('rep')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all md:px-6 md:text-base ${
                  audience === 'rep'
                    ? 'bg-gradient-to-r from-harx-alt-500 to-harx-alt-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Headphones className="h-4 w-4" />
                Rep · Find Gigs
              </button>
            </div>
          </div>

          <div className="mx-auto mb-20 max-w-6xl">
            {audience === 'company' ? (
              <div key="company-pricing-table">
                <p className="mb-4 text-center text-sm font-medium text-slate-500">
                  Company plans — post gigs and scale your contact centre.
                </p>
                <StripePricingTableEmbed pricingTableId={COMPANY_PRICING_TABLE_ID} />
              </div>
            ) : (
              <div key="rep-pricing-table">
                <p className="mb-4 text-center text-sm font-medium text-slate-500">
                  Rep plans — find gigs and grow your earnings.
                </p>
                <StripePricingTableEmbed pricingTableId={REP_PRICING_TABLE_ID} />
              </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="mb-8 text-2xl font-bold text-slate-900 md:text-3xl">
              Ready to Transform Your Operations?
            </h2>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Button
                variant="gradient"
                size="xl"
                onClick={onGetStarted}
                className="group min-w-[220px] shadow-lg md:min-w-[240px]"
              >
                <span className="flex items-center justify-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={bookDemo}
                className="group min-w-[220px] md:min-w-[240px]"
              >
                <span className="flex items-center justify-center">
                  Schedule a Demo
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

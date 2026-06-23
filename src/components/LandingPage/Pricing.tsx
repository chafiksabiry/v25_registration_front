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
    <div className="pt-8 md:pt-12">
      <div className="relative overflow-hidden bg-gradient-to-b from-harx-50 via-white to-harx-alt-50 py-10 md:py-14">
        <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-harx-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-harx-alt-300/20 blur-3xl" />

        <div className="container relative mx-auto px-4">
          <div className="mx-auto mb-6 max-w-3xl text-center">
            <div className="rounded-xl bg-gradient-to-r from-harx-600 to-harx-alt-500 p-4 shadow-lg md:p-5">
              <div className="mb-1 flex items-center justify-center gap-2 text-white">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                <h2 className="text-base font-bold md:text-lg">Limited Time Offer</h2>
                <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <p className="text-sm text-white md:text-base">
                Get 50% off company plans when you subscribe today!
              </p>
              <p className="mt-1 text-xs text-harx-100">*Offer valid for the first 3 months</p>
            </div>
          </div>

          <div className="mx-auto mb-6 max-w-3xl text-center">
            <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
              Subscription Plans
            </h1>
            <p className="text-sm text-slate-600 md:text-base">
              Prices synced with Stripe — choose the profile that matches you.
            </p>

            <div className="mt-4 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setAudience('company')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all md:px-5 md:py-2.5 md:text-sm ${
                  audience === 'company'
                    ? 'bg-gradient-to-r from-harx-500 to-harx-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Company · Post a Gig
              </button>
              <button
                type="button"
                onClick={() => setAudience('rep')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all md:px-5 md:py-2.5 md:text-sm ${
                  audience === 'rep'
                    ? 'bg-gradient-to-r from-harx-alt-500 to-harx-alt-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Headphones className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Rep · Find Gigs
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500 md:text-sm">
              {audience === 'company' ? (
                <>
                  <span className="font-semibold text-slate-700">Are you a company?</span>{' '}
                  Post gigs, recruit REPs, and scale your contact centre.
                  {' · '}
                  <button
                    type="button"
                    onClick={() => setAudience('rep')}
                    className="font-semibold text-harx-alt-600 underline-offset-2 hover:underline"
                  >
                    Want to become a Rep?
                  </button>
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-700">Want to become a Rep?</span>{' '}
                  Find gigs, work remotely, and grow your earnings.
                  {' · '}
                  <button
                    type="button"
                    onClick={() => setAudience('company')}
                    className="font-semibold text-harx-600 underline-offset-2 hover:underline"
                  >
                    Are you a company?
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="mx-auto mb-12 w-full max-w-[90rem] px-2 sm:px-0">
            {audience === 'company' ? (
              <div key="company-pricing-table" className="space-y-3">
                <div className="rounded-lg border border-harx-100 bg-harx-50/80 px-3 py-2 text-center text-xs text-harx-800 md:text-sm">
                  <Building2 className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
                  <strong>For companies</strong> — subscribe to post gigs on HARX.
                </div>
                <div className="stripe-pricing-table-scroll">
                  <StripePricingTableEmbed
                    pricingTableId={COMPANY_PRICING_TABLE_ID}
                    columns={3}
                  />
                </div>
              </div>
            ) : (
              <div key="rep-pricing-table" className="space-y-3">
                <div className="rounded-lg border border-harx-alt-100 bg-harx-alt-50/80 px-3 py-2 text-center text-xs text-harx-alt-800 md:text-sm">
                  <Headphones className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
                  <strong>For REPs</strong> — subscribe to access gigs and start earning.
                </div>
                <div className="stripe-pricing-table-scroll">
                  <StripePricingTableEmbed
                    pricingTableId={REP_PRICING_TABLE_ID}
                    columns={4}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="mb-5 text-xl font-bold text-slate-900 md:text-2xl">
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

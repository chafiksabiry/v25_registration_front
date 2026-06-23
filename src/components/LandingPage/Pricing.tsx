import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Check,
  Headphones,
  Brain,
  Globe2,
  Rocket,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Button } from './Button';

interface PricingProps {
  onGetStarted: () => void;
}

type PlanAudience = 'company' | 'rep';

interface PlanCard {
  name: string;
  description: string;
  price: number | 'free';
  currency?: string;
  originalPrice?: string;
  discountedPrice?: string;
  features: string[];
  popular?: boolean;
  audience: PlanAudience;
  icon: React.ComponentType<{ className?: string }>;
  highlight: string;
  iconColor: string;
}

const companyPlans: PlanCard[] = [
  {
    name: 'Free',
    description: 'Test, validate, and pay only for what you consume',
    price: 'free',
    audience: 'company',
    features: [
      'Manual matching and planning',
      'Pay-as-you-go AI automation',
      'On-demand AI quality audit',
      '7-day call storage',
      'Email support',
    ],
    icon: Shield,
    highlight: 'from-green-50 to-white',
    iconColor: 'text-green-600',
  },
  {
    name: 'Starter',
    description: 'Start your campaigns with simplicity and efficiency',
    price: 99,
    currency: 'USD',
    audience: 'company',
    originalPrice: '199',
    discountedPrice: '99',
    features: [
      'Manual scheduler for shifts',
      'Basic matching system',
      '5 AI quality audits/month',
      'Standard HARX platform',
      'Email support with onboarding',
    ],
    icon: Brain,
    highlight: 'from-blue-50 to-white',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Growth',
    description: 'Drive multichannel efforts with AI automation',
    price: 249,
    currency: 'USD',
    audience: 'company',
    originalPrice: '499',
    discountedPrice: '249',
    popular: true,
    features: [
      'Optional AI scheduler & matching',
      '25 AI quality audits/month',
      '90-day call storage',
      'Priority support + chat',
      'Partial branding options',
    ],
    icon: Rocket,
    highlight: 'from-harx-50 to-white',
    iconColor: 'text-harx-600',
  },
  {
    name: 'Scale',
    description: 'Activate intelligence at scale',
    price: 499,
    currency: 'USD',
    audience: 'company',
    originalPrice: '999',
    discountedPrice: '499',
    features: [
      'Intelligent AI matching',
      '100 AI quality audits/month',
      'Advanced analytics',
      'Native CRM integrations',
      '48h SLA support',
    ],
    icon: Globe2,
    highlight: 'from-orange-50 to-white',
    iconColor: 'text-orange-600',
  },
];

const repPlans: PlanCard[] = [
  {
    name: 'Take a chance',
    description: 'Completely free. Prove you can earn. No commitment.',
    price: 'free',
    audience: 'rep',
    features: [
      'Earn up to €30/month',
      'Real-time wallet & basic analytics',
      '3 gigs only',
      'First-Come, First-Served booking',
      'Email support — 24h',
    ],
    icon: Shield,
    highlight: 'from-green-50 to-white',
    iconColor: 'text-green-600',
  },
  {
    name: 'Pay the bills',
    description: "Now I'm making real money.",
    price: 9.99,
    currency: 'EUR',
    audience: 'rep',
    features: [
      'Earn up to €200/month',
      'Advanced analytics',
      '10 gigs',
      'Priority slot waiting list',
      '7 days free trial',
    ],
    icon: Brain,
    highlight: 'from-blue-50 to-white',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Money must be funny',
    description: 'Bills paid. Fun money time.',
    price: 19.99,
    currency: 'EUR',
    audience: 'rep',
    popular: true,
    features: [
      'Earn up to €500/month',
      '100 gigs',
      'Priority slot booking',
      'Full call history access',
      '7 days free trial',
    ],
    icon: Rocket,
    highlight: 'from-harx-50 to-white',
    iconColor: 'text-harx-600',
  },
  {
    name: "In the rich man's world",
    description: "I'm elite. No limits.",
    price: 59.99,
    currency: 'EUR',
    audience: 'rep',
    features: [
      'Unlimited monthly earning',
      'Priority premium gigs',
      'All AI features included',
      'No extra wallet fees',
      '7 days free trial',
    ],
    icon: Globe2,
    highlight: 'from-orange-50 to-white',
    iconColor: 'text-orange-600',
  },
];

const allPlans: PlanCard[] = [...companyPlans, ...repPlans];

function formatMoney(amount: number, currency = 'EUR'): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function audienceLabel(audience: PlanAudience) {
  return audience === 'company' ? 'Company' : 'Rep';
}

function ctaLabel(plan: PlanCard) {
  if (plan.audience === 'company') return 'Post a Gig';
  if (plan.price === 'free') return 'Find Gigs';
  return 'Start Trial';
}

function PlanPrice({ plan }: { plan: PlanCard }) {
  if (plan.price === 'free') {
    return <span className="text-2xl font-black text-slate-900 xl:text-3xl">Free</span>;
  }

  if (plan.audience === 'company' && plan.discountedPrice) {
    return (
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-lg font-bold text-slate-400 line-through xl:text-xl">
            ${plan.originalPrice}
          </span>
          <span className="rounded-full bg-harx-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-harx-700">
            -50%
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-harx-600 xl:text-3xl">
            ${plan.discountedPrice}
          </span>
          <span className="text-xs font-semibold text-slate-500">/mo</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-black text-harx-600 xl:text-3xl">
        {formatMoney(plan.price, plan.currency)}
      </span>
      <span className="text-xs font-semibold text-slate-500">/mo</span>
    </div>
  );
}

export function Pricing({ onGetStarted }: PricingProps) {
  const navigate = useNavigate();

  const bookDemo = () => {
    window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
  };

  const goToRegister = (role: PlanAudience) => {
    localStorage.setItem('pendingUserType', role);
    navigate('/auth/register');
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
              Company plans to post gigs and rep plans to find gigs — all in one place.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-harx-200 bg-white px-3 py-1 text-xs font-bold text-harx-700 shadow-sm">
                <Building2 className="h-3.5 w-3.5" />
                Company · Post a Gig
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-harx-alt-200 bg-white px-3 py-1 text-xs font-bold text-harx-alt-700 shadow-sm">
                <Headphones className="h-3.5 w-3.5" />
                Rep · Find Gigs
              </span>
            </div>
          </div>

          {/* All 8 plans — 1 row on 2xl, 4 cols on lg, 2 on sm, 1 on mobile */}
          <div className="mb-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8">
            {allPlans.map((plan) => {
              const isCompany = plan.audience === 'company';
              return (
                <div
                  key={`${plan.audience}-${plan.name}`}
                  className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    plan.popular
                      ? 'ring-harx-500 shadow-harx-500/15'
                      : isCompany
                        ? 'ring-harx-100 hover:ring-harx-300'
                        : 'ring-harx-alt-100 hover:ring-harx-alt-300'
                  }`}
                >
                  <div
                    className={`h-1.5 w-full ${
                      isCompany
                        ? 'bg-gradient-to-r from-harx-500 to-harx-600'
                        : 'bg-gradient-to-r from-harx-alt-500 to-harx-alt-600'
                    }`}
                  />

                  {plan.popular && (
                    <div className="absolute -top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-harx-500 to-harx-alt-500 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                      Popular
                    </div>
                  )}

                  <div className={`bg-gradient-to-b px-4 pb-3 pt-5 ${plan.highlight}`}>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
                        <plan.icon className={`h-5 w-5 ${plan.iconColor}`} />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                          isCompany
                            ? 'bg-harx-100 text-harx-700'
                            : 'bg-harx-alt-100 text-harx-alt-700'
                        }`}
                      >
                        {isCompany ? (
                          <Building2 className="h-3 w-3" />
                        ) : (
                          <Headphones className="h-3 w-3" />
                        )}
                        {audienceLabel(plan.audience)}
                      </span>
                    </div>

                    <h3 className="text-sm font-black uppercase leading-tight tracking-tight text-slate-900 xl:text-base">
                      {plan.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-snug text-slate-600">
                      {plan.description}
                    </p>
                    <div className="mt-3">
                      <PlanPrice plan={plan} />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4 pt-3">
                    <ul className="flex-1 space-y-1.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-1.5">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-harx-500" />
                          <span className="text-[11px] leading-snug text-slate-600 xl:text-xs">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.popular ? 'gradient' : 'primary'}
                      size="lg"
                      fullWidth
                      onClick={() => goToRegister(plan.audience)}
                      className="group/btn mt-auto !py-2.5 text-sm shadow-sm"
                    >
                      <span className="flex items-center justify-center gap-1">
                        {ctaLabel(plan)}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                      </span>
                    </Button>
                  </div>
                </div>
              );
            })}
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

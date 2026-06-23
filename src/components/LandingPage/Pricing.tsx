import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Check,
  Headphones,
  Brain,
  Users2,
  Globe2,
  Rocket,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Button } from './Button';

interface PricingProps {
  onGetStarted: () => void;
}

type PricingTab = 'company' | 'reps';

interface PlanCard {
  name: string;
  description: string;
  price: number | 'custom' | 'free';
  currency?: string;
  originalPrice?: string;
  discountedPrice?: string;
  features: string[];
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  highlight: string;
  iconColor: string;
}

/** Company plans — synced with Stripe pricing table (live). */
const companyPlans: PlanCard[] = [
  {
    name: 'Free',
    description: 'Test, validate, and pay only for what you consume',
    price: 'free',
    features: [
      'Manual matching and planning',
      'Pay-as-you-go AI automation',
      'On-demand AI quality audit',
      '7-day call storage',
      'Email support',
      'No customization options',
    ],
    icon: Shield,
    highlight: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    name: 'Starter',
    description: 'Start your campaigns with simplicity and efficiency',
    price: 99,
    currency: 'USD',
    originalPrice: '199',
    discountedPrice: '99',
    features: [
      'Manual scheduler for shifts',
      'Basic matching system',
      'Single geography operations',
      '5 AI quality audits/month',
      'Standard HARX platform',
      'Basic analytics',
      'Email support with assisted onboarding',
    ],
    icon: Brain,
    highlight: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Growth',
    description: 'Drive multichannel efforts with AI automation',
    price: 249,
    currency: 'USD',
    originalPrice: '499',
    discountedPrice: '249',
    popular: true,
    features: [
      'Optional AI scheduler',
      'Optional AI matching',
      '25 AI quality audits/month',
      'Optional AI Knowledge Base',
      '90-day call storage',
      'Standard analytics',
      'Priority support + chat',
      'Partial branding options',
    ],
    icon: Rocket,
    highlight: 'bg-harx-50',
    iconColor: 'text-harx-600',
  },
  {
    name: 'Scale',
    description: 'Activate intelligence at scale',
    price: 499,
    currency: 'USD',
    originalPrice: '999',
    discountedPrice: '499',
    features: [
      'Intelligent AI matching',
      'AI scheduler with scoring',
      '100 AI quality audits/month',
      'GIG-specific AI learning',
      'Automated call journaling',
      'Advanced analytics',
      'Native CRM integrations',
      '48h SLA support',
      'Full platform customization',
    ],
    icon: Globe2,
    highlight: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    name: 'Enterprise',
    description: 'Your complete AI-powered productivity platform',
    price: 'custom',
    features: [
      'Predictive AI matching',
      'Advanced AI scheduler',
      '500 AI quality audits/month',
      'Live AI-Augmented Agent',
      'Dedicated LLM per GIG',
      'Custom workflows',
      'Advanced analytics + AI alerts',
      'Complete API access',
      '24/7 dedicated support',
      'White-label solution',
    ],
    icon: Users2,
    highlight: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
];

/** Rep plans — synced with Stripe pricing table (live). */
const repPlans: PlanCard[] = [
  {
    name: 'Take a chance',
    description:
      'Completely free. Prove you can earn. No commitment. If you like it and hit €30, upgrade to unlock more.',
    price: 'free',
    features: [
      'Earn up to €30/month',
      'Dashboard: Real-time wallet balance; Basic analytics',
      '3 gigs only',
      'Slot Booking: First-Come, First-Served',
      'Call History: Cannot listen to recordings, see AI scores, or read transcripts',
      'Support by email — 24 hours',
    ],
    icon: Shield,
    highlight: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    name: 'Pay the bills',
    description: "Now I'm making real money.",
    price: 9.99,
    currency: 'EUR',
    features: [
      'Earn up to €200/month',
      'Dashboard: Advanced analytics',
      '10 gigs',
      'Slot Booking: Priority on waiting list',
      'Call History: Listen to recordings, see AI scores, and read transcripts',
      'Support by email or chat',
      '7 days free trial',
    ],
    icon: Brain,
    highlight: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Money must be funny',
    description: 'Bills paid. Fun money time.',
    price: 19.99,
    currency: 'EUR',
    popular: true,
    features: [
      'Earn up to €500/month',
      'Dashboard: Advanced analytics',
      '100 gigs',
      'Slot Booking: Priority',
      'Call History: Listen to recordings, see AI scores, read transcripts',
      'Support by Phone, email or chat',
      '7 days free trial',
    ],
    icon: Rocket,
    highlight: 'bg-harx-50',
    iconColor: 'text-harx-600',
  },
  {
    name: "In the rich man's world",
    description: "I'm elite. No limits.",
    price: 59.99,
    currency: 'EUR',
    features: [
      'Unlimited Monthly Earning',
      'Priority Access to Premium Gigs',
      'Priority to book slots',
      'All AI-powered features for free',
      'No extra fees for wallet management',
      'Support by Phone, email or chat',
      '7 days free trial',
    ],
    icon: Globe2,
    highlight: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
];

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

export function Pricing({ onGetStarted }: PricingProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<PricingTab>('reps');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const contactSales = () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      scrollToSection('contact-form');
    } else {
      window.location.href = 'mailto:sales@harx.ai';
    }
  };

  const bookDemo = () => {
    window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
  };

  const goToRegister = (role: 'company' | 'rep') => {
    localStorage.setItem('pendingUserType', role);
    navigate('/auth/register');
  };

  const handlePlanAction = (plan: PlanCard, role: 'company' | 'rep') => {
    if (plan.price === 'custom') {
      contactSales();
      return;
    }
    goToRegister(role);
  };

  const activePlans = tab === 'company' ? companyPlans : repPlans;
  const gridClass =
    tab === 'reps'
      ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';

  const ctaLabel = (plan: PlanCard) => {
    if (plan.price === 'custom') return 'Contact Sales';
    if (tab === 'company') return plan.price === 'free' ? 'Post a Gig' : 'Post a Gig';
    if (plan.price === 'free') return 'Find Gigs';
    return 'Start Trial';
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="relative overflow-hidden bg-gradient-to-b from-harx-50 via-white to-harx-alt-50 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-8 max-w-4xl text-center">
            <div className="rounded-2xl bg-gradient-to-r from-harx-600 to-harx-500 p-6 text-white shadow-xl">
              <div className="mb-2 flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Limited Time Offer</h2>
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="text-xl">Get 50% off on all plans when you subscribe today!</p>
              <p className="mt-2 text-sm text-harx-100">*Offer valid for the first 3 months</p>
            </div>
          </div>

          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">Subscription Plans</h1>
            <p className="text-xl text-gray-600">
              {tab === 'company'
                ? 'Choose your company plan and post gigs on HARX.'
                : 'Choose your rep plan and find gigs on HARX.'}
            </p>
          </div>

          <div className="mb-12 flex justify-center">
            <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setTab('company')}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  tab === 'company'
                    ? 'bg-harx-500 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Company
              </button>
              <button
                type="button"
                onClick={() => setTab('reps')}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  tab === 'reps'
                    ? 'bg-harx-alt-500 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Headphones className="h-4 w-4" />
                Reps
              </button>
            </div>
          </div>

          <div className={`${gridClass} mb-24`}>
            {activePlans.map((plan) => (
              <div
                key={`${tab}-${plan.name}`}
                className={`relative flex h-full flex-col rounded-2xl bg-white shadow-lg transition-transform duration-300 hover:scale-[1.02] ${
                  plan.popular ? 'scale-[1.02] ring-2 ring-harx-500' : 'border border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-harx-500 to-harx-600 px-6 py-1 text-sm font-medium text-white shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className={`rounded-t-2xl px-6 pb-4 pt-8 ${plan.highlight}`}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md">
                    <plan.icon className={`h-6 w-6 ${plan.iconColor}`} />
                  </div>
                  <h3 className="mb-2 text-xl font-black uppercase tracking-tight">{plan.name}</h3>
                  <p className="min-h-[48px] text-sm text-gray-600">{plan.description}</p>

                  <div className="mt-4 mb-2">
                    {plan.price === 'free' ? (
                      <span className="text-4xl font-bold">Free</span>
                    ) : plan.price === 'custom' ? (
                      <span className="text-4xl font-bold">Custom</span>
                    ) : tab === 'company' && plan.discountedPrice ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-start gap-2">
                          <span className="text-3xl font-bold text-gray-400 line-through">
                            ${plan.originalPrice}
                          </span>
                          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                            -50%
                          </span>
                        </div>
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-harx-600">
                            ${plan.discountedPrice}
                          </span>
                          <span className="ml-2 text-gray-600">/month</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline">
                        <span className="text-3xl font-black text-harx-600">
                          {formatMoney(plan.price, plan.currency)}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">/ month</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-grow flex-col gap-4 p-6">
                  <ul className="flex-grow space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        <span className="ml-2 text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? 'gradient' : 'primary'}
                    size="lg"
                    fullWidth
                    onClick={() => handlePlanAction(plan, tab === 'company' ? 'company' : 'rep')}
                    className="group mt-auto shadow-sm"
                  >
                    <span className="flex items-center justify-center">
                      {ctaLabel(plan)}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 text-center">
            <h2 className="mb-8 text-3xl font-bold">Ready to Transform Your Operations?</h2>
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Button
                variant="gradient"
                size="xl"
                onClick={onGetStarted}
                className="group min-w-[240px] shadow-lg"
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
                className="group min-w-[240px]"
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

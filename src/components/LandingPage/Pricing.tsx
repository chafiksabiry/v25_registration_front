import React from 'react';
import { ArrowRight, Check, Brain, Users2, Globe2, Rocket, Shield, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface PricingProps {
  onGetStarted: () => void;
}

const platformTiers = [
  {
    name: 'Free',
    description: 'Test, validate, and pay only for what you consume',
    monthlyPrice: '0',
    specs: {
      'Active GIGs': '1',
      'Active REPs': '1',
      'Phone Numbers': '1 test zone',
      'Channels': 'Calls only'
    },
    features: [
      'Manual matching and planning',
      'Pay-as-you-go AI automation',
      'On-demand AI quality audit',
      '7-day call storage',
      'Email support',
      'No customization options'
    ],
    icon: Shield,
    color: 'green',
    highlight: 'bg-green-50',
    popular: false
  },
  {
    name: 'Starter',
    description: 'Start your campaigns with simplicity and efficiency',
    monthlyPrice: '199',
    discountedPrice: '99',
    specs: {
      'Active GIGs': '3',
      'Active REPs': '5',
      'Phone Numbers': '1 included',
      'Channels': 'Calls only'
    },
    features: [
      'Manual scheduler for shifts',
      'Basic matching system',
      'Single geography operations',
      '5 AI quality audits/month',
      'Standard HARX platform',
      'Basic analytics',
      'Email support with assisted onboarding'
    ],
    icon: Brain,
    color: 'blue',
    highlight: 'bg-blue-50',
    popular: false
  },
  {
    name: 'Growth',
    description: 'Drive multichannel efforts with AI automation',
    monthlyPrice: '499',
    discountedPrice: '249',
    specs: {
      'Active GIGs': '10',
      'Active REPs': '15',
      'Phone Numbers': '3 included',
      'Channels': 'Calls + Email'
    },
    features: [
      'Optional AI scheduler',
      'Optional AI matching',
      '25 AI quality audits/month',
      'Optional AI Knowledge Base',
      '90-day call storage',
      'Standard analytics',
      'Priority support + chat',
      'Partial branding options'
    ],
    icon: Rocket,
    color: 'harx',
    highlight: 'bg-harx-50',
    popular: true
  },
  {
    name: 'Scale',
    description: 'Activate intelligence at scale',
    monthlyPrice: '999',
    discountedPrice: '499',
    specs: {
      'Active GIGs': '25',
      'Active REPs': '50',
      'Phone Numbers': '10 included',
      'Channels': 'All channels'
    },
    features: [
      'Intelligent AI matching',
      'AI scheduler with scoring',
      '100 AI quality audits/month',
      'GIG-specific AI learning',
      'Automated call journaling',
      'Advanced analytics',
      'Native CRM integrations',
      '48h SLA support',
      'Full platform customization'
    ],
    icon: Globe2,
    color: 'orange',
    highlight: 'bg-orange-50',
    popular: false
  },
  {
    name: 'Enterprise',
    description: 'Your complete AI-powered productivity platform',
    monthlyPrice: 'Custom',
    specs: {
      'Active GIGs': 'Unlimited',
      'Active REPs': 'Unlimited',
      'Phone Numbers': 'Multi-region',
      'Channels': 'All channels'
    },
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
      'White-label solution'
    ],
    icon: Users2,
    color: 'purple',
    highlight: 'bg-purple-50',
    popular: false
  }
];

export function Pricing({ onGetStarted }: PricingProps) {
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

  const handlePlanAction = (tier: typeof platformTiers[0]) => {
    if (tier.monthlyPrice === 'Custom') {
      contactSales();
    } else {
      onGetStarted();
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="container mx-auto px-4">
          {/* Promotional Banner */}
          <div className="max-w-4xl mx-auto text-center mb-8">
            <div className="bg-gradient-to-r from-harx-600 to-harx-500 text-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Limited Time Offer</h2>
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="text-xl">Get 50% off on all plans when you subscribe today!</p>
              <p className="text-sm mt-2 text-harx-100">*Offer valid for the first 3 months</p>
            </div>
          </div>

          {/* Platform Plans Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Platform Subscription Plans
            </h1>
            <p className="text-xl text-gray-600">
              Choose your plan and scale as you grow. All plans include platform access and core features.
            </p>
          </div>

          {/* Platform Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-24">
            {platformTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-white rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105 ${tier.popular ? 'ring-2 ring-harx-500 scale-105' : 'border border-gray-100'
                  } flex flex-col h-full`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-harx-500 to-harx-600 text-white px-6 py-1 rounded-full text-sm font-medium shadow-lg whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                {/* Header section */}
                <div className={`px-6 pt-8 pb-4 rounded-t-2xl ${tier.highlight}`}>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <tier.icon className={`h-6 w-6 text-${tier.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-gray-600 min-h-[48px] text-sm">{tier.description}</p>

                  {/* Pricing */}
                  <div className="mt-4 mb-2">
                    {tier.monthlyPrice === '0' ? (
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold">Free</span>
                      </div>
                    ) : tier.monthlyPrice === 'Custom' ? (
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold">Custom</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-start gap-2">
                          <span className="text-4xl font-bold text-gray-400 line-through">${tier.monthlyPrice}</span>
                          <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            -50%
                          </span>
                        </div>
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-harx-600">${tier.discountedPrice}</span>
                          <span className="text-gray-600 ml-2">/month</span>
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Platform access & resources</p>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col gap-6">
                  {/* Resource Specifications */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold mb-3 text-sm text-gray-900">Resource Allocation</h4>
                    <div className="space-y-2">
                      {Object.entries(tier.specs).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="flex-grow">
                    <h4 className="font-semibold mb-3 text-sm text-gray-900">Features Included</h4>
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="ml-3 text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action button */}
                  <div className="pt-4 mt-auto">
                    <Button
                      variant={tier.popular ? 'gradient' : 'primary'}
                      size="lg"
                      fullWidth
                      onClick={() => handlePlanAction(tier)}
                      className="group shadow-sm"
                    >
                      <span className="flex items-center justify-center">
                        {tier.monthlyPrice === 'Custom'
                          ? 'Contact Sales'
                          : tier.monthlyPrice === '0'
                            ? 'Start Free'
                            : 'Choose Plan'}
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to Transform Your Operations?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
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

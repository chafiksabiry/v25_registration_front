import React from 'react';
import { ArrowRight, Users, Brain } from 'lucide-react';
import { Button } from './Button';

interface HowItWorksProps {
  onGetStarted: () => void;
}

type StepSide = 'left' | 'right';

interface StepContent {
  number: number;
  side: StepSide;
  title: string;
  body: React.ReactNode;
}

const stepSideClass: Record<StepSide, string> = {
  left: 'md:pr-10',
  right: 'md:col-start-2 md:pl-10',
};

const steps: StepContent[] = [
  {
    number: 1,
    side: 'left',
    title: 'Post your gig',
    body: (
      <p className="text-gray-600 text-justify">
        Define your campaign, your leads, your script, and what a transaction means for you. Our AI generates everything else.
      </p>
    ),
  },
  {
    number: 2,
    side: 'right',
    title: 'Get matched instantly',
    body: (
      <p className="text-gray-600 text-justify">
        Harx AI matches your gig to the right certified agents from our global network. Language, industry, activity — every dimension scored and verified.
      </p>
    ),
  },
  {
    number: 3,
    side: 'left',
    title: 'Name your price',
    body: (
      <p className="text-gray-600 text-justify">
        Set your own compensation levels. You set the amounts, guided by AI benchmarks. harx takes a portion (%) only when your rep earns a transaction.
      </p>
    ),
  },
  {
    number: 4,
    side: 'right',
    title: "You only pay what it's worth.",
    body: (
      <>
        <p className="text-gray-600 mb-6 text-justify">
          Floor for effort. Commission for results. Bonus for excellence.
        </p>
        <ul className="space-y-4 text-gray-600">
          <li className="flex items-start gap-3">
            <span className="shrink-0 rounded-full bg-harx-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-harx-600">
              Floor
            </span>
            <span className="pt-0.5 text-justify">Pay for a serious, argued interaction</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="shrink-0 rounded-full bg-harx-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-harx-600">
              Commission
            </span>
            <span className="pt-0.5 text-justify">Pay when a transaction is confirmed</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="shrink-0 rounded-full bg-harx-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-harx-600">
              Bonus
            </span>
            <span className="pt-0.5 text-justify">Pay when your target is reached</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    number: 5,
    side: 'left',
    title: 'Your budget is a contract, not an estimate',
    body: (
      <div className="space-y-3 text-gray-600 text-justify">
        <p>Harx is transparent by design.</p>
        <p>You decide how much a gig costs — down to the cent.</p>
        <p>You define the price of effort; You define the price of performance; You only pay when it happens.</p>
        <p>Reps take the lion&apos;s share; Harx takes a portion; AI verifies everything.</p>
        <p>Beyond performance, three simple costs : Your plan. Your numbers. Your minutes.</p>
      </div>
    ),
  },
  {
    number: 6,
    side: 'right',
    title: 'AI scoring on every call',
    body: (
      <p className="text-gray-600 text-justify">
        Transcribed, analyzed and scored in seconds by AI : Fraud detected, Sentiment measured, Transaction confirmed.
      </p>
    ),
  },
  {
    number: 7,
    side: 'left',
    title: 'Scale globally — 60,000+ certified agents across 70+ countries',
    body: (
      <p className="text-gray-600 text-justify">
        Harx works with human agents today, AI agents tomorrow, and any mix in between.
      </p>
    ),
  },
];

function TimelineStep({ number, side, title, body }: StepContent) {
  return (
    <div className="relative grid md:grid-cols-2 gap-8 items-center">
      <div className={`w-full ${stepSideClass[side]}`}>
        <div className="bg-harx-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">
          {number}
        </div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        {body}
      </div>
    </div>
  );
}

export function HowItWorks({ onGetStarted }: HowItWorksProps) {
  const bookDemo = () => {
    window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
  };

  return (
    <div className="pt-16 pb-12">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How HARX Works
          </h1>
          <p className="text-xl text-gray-600 text-justify">
            No infrastructure. No hiring. No upfront cost. No complexity. Just a certified team, a live AI scoring every interaction, and a simple rule : you pay only when it works.
          </p>
        </div>

        {/* Platform Preview */}
        <div className="max-w-5xl mx-auto mb-24">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1920&q=80"
              alt="AI-powered customer service platform"
              className="w-full h-[600px] object-cover"
            />

            {/* Floating Stats Cards */}
            <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-harx-500" />
                <div>
                  <div className="font-semibold">AI Response Time</div>
                  <div className="text-2xl font-bold text-harx-500">0.3s</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-harx-500" />
                <div>
                  <div className="font-semibold">Active Agents</div>
                  <div className="text-2xl font-bold text-harx-500">60,000+</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-harx-200 hidden md:block" />

            {/* Steps — odd: left, even: right */}
            <div className="space-y-24">
              {steps.map((step) => (
                <TimelineStep key={step.number} {...step} />
              ))}
            </div>
          </div>

          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold mb-6">You have leads. We have agents. You pay per result.
              <br />
              HARX the Transaction as a Service™ Platform powered by AI</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="gradient"
                onClick={onGetStarted}
                className="group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={bookDemo}
                className="group"
              >
                Book a Demo
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

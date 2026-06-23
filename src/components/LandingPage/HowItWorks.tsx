import React from 'react';
import { ArrowRight, Target, Users, CreditCard, Headphones, Brain, Globe2, Bot, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

interface HowItWorksProps {
  onGetStarted: () => void;
}

export function HowItWorks({ onGetStarted }: HowItWorksProps) {
  const bookDemo = () => {
    window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How HARX Works
          </h1>
          <p className="text-xl text-gray-600">
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

            {/* Steps */}
            <div className="space-y-24">
              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div className="md:text-right">
                  <div className="bg-harx-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 md:ml-auto">1</div>
                  <h3 className="text-2xl font-bold mb-4">Immediate start — list your campaign in minutes                  </h3>
                  <p className="text-gray-600 mb-6">
                    Tell us your customer engagement requirements - channels, languages, volumes, and success metrics.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="w-16 h-16 bg-harx-100 rounded-lg flex items-center justify-center mb-6">
                    <Headphones className="h-8 w-8 text-harx-600" />
                  </div>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Choose support channels</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Set quality standards</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Define success metrics</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div className="md:order-2">
                  <div className="bg-harx-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
                  <h3 className="text-2xl font-bold mb-4">Engage AI-matched team</h3>
                  <p className="text-gray-600 mb-6">
                    Our AI matches your needs with the perfect agents from our global network, ensuring optimal performance and cultural alignment. right profile, right language, right industry.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg md:order-1">
                  <div className="w-16 h-16 bg-harx-100 rounded-lg flex items-center justify-center mb-6">
                    <Brain className="h-8 w-8 text-harx-600" />
                  </div>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>AI-powered agent matching</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Flexible team scaling</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Real-time performance monitoring</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div className="md:text-right">
                  <div className="bg-harx-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 md:ml-auto">3</div>
                  <h3 className="text-2xl font-bold mb-4">Name your price</h3>
                  <p className="text-gray-600 mb-6">
                    You set the amounts. harx ensures fairness. AI confirms every result.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="w-16 h-16 bg-harx-100 rounded-lg flex items-center justify-center mb-6">
                    <CreditCard className="h-8 w-8 text-harx-600" />
                  </div>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Floor : Effort rewarded</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Commission : Result paid</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Bonus : Excellence unlocked</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div className="md:order-2">
                  <div className="bg-harx-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">4</div>
                  <h3 className="text-2xl font-bold mb-4">Only pay when it works</h3>
                  <p className="text-gray-600 mb-6">
                    Only pay when customer inquiries are successfully resolved.
                  </p>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 rounded-full bg-harx-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-harx-600">
                        Floor
                      </span>
                      <span className="pt-0.5">Pay for a serious, argued interaction</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 rounded-full bg-harx-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-harx-600">
                        Commission
                      </span>
                      <span className="pt-0.5">Pay when a transaction is confirmed</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="shrink-0 rounded-full bg-harx-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-harx-600">
                        Bonus
                      </span>
                      <span className="pt-0.5">Pay when your target is reached</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg md:order-1">
                  <div className="w-16 h-16 bg-harx-100 rounded-lg flex items-center justify-center mb-6">
                    <Globe2 className="h-8 w-8 text-harx-600" />
                  </div>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Resolution-based billing</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Transparent pricing</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>No hidden fees</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div className="md:text-right">
                  <div className="bg-harx-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 md:ml-auto">5</div>
                  <h3 className="text-2xl font-bold mb-4 md:ml-auto md:max-w-md">No upfront investment — choose your plan, adjust anytime</h3>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="w-16 h-16 bg-harx-100 rounded-lg flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-8 w-8 text-harx-600" />
                  </div>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Choose your plan</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Adjust anytime</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>No upfront investment</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div className="md:order-2">
                  <div className="bg-harx-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">6</div>
                  <h3 className="text-2xl font-bold mb-4">Live monitoring</h3>
                  <p className="text-gray-600 mb-6">
                    Every interaction scored in real time by AI.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg md:order-1">
                  <div className="w-16 h-16 bg-harx-100 rounded-lg flex items-center justify-center mb-6">
                    <Brain className="h-8 w-8 text-harx-600" />
                  </div>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Every call transcribed, scored, and validated by AI in real time</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Live AI scoring every interaction</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                <div className="md:text-right">
                  <div className="bg-harx-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 md:ml-auto">7</div>
                  <h3 className="text-2xl font-bold mb-4 md:ml-auto md:max-w-md">
                    Scale globally — 60,000+ certified agents across 70+ countries
                  </h3>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg">
                  <div className="w-16 h-16 bg-harx-100 rounded-lg flex items-center justify-center mb-6">
                    <Globe2 className="h-8 w-8 text-harx-600" />
                  </div>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>60,000+ certified agents</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>70+ countries worldwide</span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-harx-600 mt-1 mr-2 flex-shrink-0" />
                      <span>Scale globally on demand</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Contact Centre Operations?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="gradient"
                onClick={onGetStarted}
                className="group"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={bookDemo}
                className="group"
              >
                Schedule a Demo
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

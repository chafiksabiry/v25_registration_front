import React from 'react';
import { ArrowRight, BarChart, Globe, Rocket, Shield, Phone, Mail, MessageSquare, Video, CheckCircle2, Target } from 'lucide-react';
import { Button } from './Button';

interface ForClientsProps {
  onGetStarted: () => void;
}

const solutions = [
  {
    title: "Startups Scaling Fast",
    description: "Perfect for growing companies needing flexible, scalable customer service solutions without the overhead.",
    features: [
      "Rapid team scaling",
      "Pay-per-result model",
      "No long-term commitments"
    ],
    icon: Rocket,
    color: "harx"
  },
  {
    title: "Enterprise Solutions",
    description: "Optimize your contact centre operations and expand service capabilities with our global network of agents.",
    features: [
      "Reduced operational costs",
      "Global coverage",
      "Enterprise-grade security"
    ],
    icon: BarChart,
    color: "harx"
  },
  {
    title: "Global Operations",
    description: "Deliver 24/7 customer support worldwide with local expertise and cultural understanding.",
    features: [
      "Local market expertise",
      "Multi-language support",
      "24/7 global coverage"
    ],
    icon: Globe,
    color: "harx"
  }
];

const useCases = [
  {
    title: "Welcome Calls",
    description: "Personalized onboarding calls to new customers, ensuring they understand your product/service and feel valued.",
    channels: ["Phone", "Video"],
    metrics: "95% customer satisfaction",
    icon: Phone,
    resolutionType: "Customer Activation"
  },
  {
    title: "Confirmation & Follow-up",
    description: "Verify appointments, deliveries, and service completions while addressing any immediate concerns.",
    channels: ["Phone", "Email", "SMS"],
    metrics: "98% confirmation rate",
    icon: CheckCircle2,
    resolutionType: "Verification"
  },
  {
    title: "Customer Surveys",
    description: "Gather valuable feedback through structured interviews and satisfaction surveys.",
    channels: ["Phone", "Email", "Web Form"],
    metrics: "85% response rate",
    icon: BarChart,
    resolutionType: "Feedback Collection"
  },
  {
    title: "Lead Qualification",
    description: "Evaluate and score leads through detailed conversations to identify sales-ready opportunities.",
    channels: ["Phone", "Live Chat", "Video"],
    metrics: "40% qualification rate",
    icon: Target,
    resolutionType: "Qualified Lead"
  },
  {
    title: "Information Requests",
    description: "Handle product inquiries, pricing questions, and service information requests across all channels.",
    channels: ["Live Chat", "Email", "Phone"],
    metrics: "92% first-contact resolution",
    icon: MessageSquare,
    resolutionType: "Information Delivery"
  },
  {
    title: "Product Demonstrations",
    description: "Guide prospects through personalized product demos and feature explanations.",
    channels: ["Video", "Live Chat", "Screen Share"],
    metrics: "45% conversion to trial",
    icon: Video,
    resolutionType: "Demo Completion"
  }
];

const operationalCountries = [
  { name: "USA", region: "North America" },
  { name: "Canada", region: "North America" },
  { name: "UK", region: "Europe" },
  { name: "Germany", region: "Europe" },
  { name: "France", region: "Europe" },
  { name: "Belgium", region: "Europe" },
  { name: "Italy", region: "Europe" },
  { name: "Spain", region: "Europe" },
  { name: "Morocco", region: "Africa" },
  { name: "UAE", region: "Middle East" }
];

export function ForClients({ onGetStarted }: ForClientsProps) {
  const bookDemo = () => {
    window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="relative overflow-hidden bg-gradient-to-b from-harx-50 to-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transform Your Customer Experience
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Unlock exceptional customer service with our Transaction-as-a-Service platform.
              Only pay for successful resolutions.
            </p>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="group"
            >
              Start Your Transformation
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className={`w-16 h-16 bg-${solution.color}-100 rounded-lg flex items-center justify-center mb-6`}>
                  <solution.icon className={`h-8 w-8 text-${solution.color}-600`} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{solution.title}</h3>
                <p className="text-gray-600 mb-6">{solution.description}</p>
                <ul className="space-y-3">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <ArrowRight className="h-5 w-5 text-harx-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Use Cases */}
          <div className="max-w-6xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-center mb-4">Resolution-Based Use Cases</h2>
            <p className="text-center text-gray-600 mb-12">
              Explore how HARX delivers measurable results across various customer interactions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-harx-100 rounded-lg flex items-center justify-center mb-4">
                    <useCase.icon className="h-6 w-6 text-harx-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                  <p className="text-gray-600 mb-4">{useCase.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <Shield className="h-4 w-4 mr-2 text-harx-600" />
                      Resolution: {useCase.resolutionType}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      {useCase.metrics}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {useCase.channels.map((channel, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-harx-50 text-harx-600 rounded-full text-sm"
                        >
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Presence */}
          <div className="max-w-5xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-center mb-8">Our Global Presence</h2>
            <p className="text-center text-gray-600 mb-12">
              Currently operating in major markets across North America, Europe, Africa, and the Middle East,
              with more regions coming soon.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {['North America', 'Europe', 'Middle East & Africa'].map((region) => (
                <div key={region} className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4">{region}</h3>
                  <ul className="space-y-2">
                    {operationalCountries
                      .filter(country =>
                        region === 'Middle East & Africa'
                          ? country.region === 'Middle East' || country.region === 'Africa'
                          : country.region === region
                      )
                      .map(country => (
                        <li key={country.name} className="flex items-center text-gray-700">
                          <ArrowRight className="h-4 w-4 text-harx-600 mr-2" />
                          {country.name}
                        </li>
                      ))
                    }
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-8">
              Additional markets coming soon to serve you better.
            </p>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="group"
              >
                Contact Us Now
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

        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-harx-400/10 rounded-full blur-3xl -z-10" />
      </div>
    </div>
  );
}

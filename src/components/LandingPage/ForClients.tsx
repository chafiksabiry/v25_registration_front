import { ArrowRight, BarChart, Globe, Rocket, Shield, Phone, Mail, MessageSquare, Video, CheckCircle2, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

interface ForClientsProps {
  onGetStarted: () => void;
}

export function ForClients({ onGetStarted }: ForClientsProps) {
  const { t } = useTranslation();

  const bookDemo = () => {
    window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
  };

  const solutions = [
    {
      title: t('forClients.solution1Title', "Startups Scaling Fast"),
      description: t('forClients.solution1Desc', "Perfect for growing companies needing flexible, scalable customer service solutions without the overhead."),
      features: [
        t('forClients.sol1Feat1', "Rapid team scaling"),
        t('forClients.sol1Feat2', "Pay-per-result model"),
        t('forClients.sol1Feat3', "No long-term commitments")
      ],
      icon: Rocket,
      color: "harx"
    },
    {
      title: t('forClients.solution2Title', "Enterprise Solutions"),
      description: t('forClients.solution2Desc', "Optimize your contact centre operations and expand service capabilities with our global network of agents."),
      features: [
        t('forClients.sol2Feat1', "Reduced operational costs"),
        t('forClients.sol2Feat2', "Global coverage"),
        t('forClients.sol2Feat3', "Enterprise-grade security")
      ],
      icon: BarChart,
      color: "harx"
    },
    {
      title: t('forClients.solution3Title', "Global Operations"),
      description: t('forClients.solution3Desc', "Deliver 24/7 customer support worldwide with local expertise and cultural understanding."),
      features: [
        t('forClients.sol3Feat1', "Local market expertise"),
        t('forClients.sol3Feat2', "Multi-language support"),
        t('forClients.sol3Feat3', "24/7 global coverage")
      ],
      icon: Globe,
      color: "harx"
    }
  ];

  const useCases = [
    {
      title: t('forClients.uc1Title', "Welcome Calls"),
      description: t('forClients.uc1Desc', "Personalized onboarding calls to new customers, ensuring they understand your product/service and feel valued."),
      channels: ["Phone", "Video"],
      metrics: "95%",
      icon: Phone,
      resolutionType: t('forClients.uc1Res', "Customer Activation")
    },
    {
      title: t('forClients.uc2Title', "Confirmation & Follow-up"),
      description: t('forClients.uc2Desc', "Verify appointments, deliveries, and service completions while addressing any immediate concerns."),
      channels: ["Phone", "Email", "SMS"],
      metrics: "98%",
      icon: CheckCircle2,
      resolutionType: t('forClients.uc2Res', "Verification")
    },
    {
      title: t('forClients.uc3Title', "Customer Surveys"),
      description: t('forClients.uc3Desc', "Gather valuable feedback through structured interviews and satisfaction surveys."),
      channels: ["Phone", "Email", "Web Form"],
      metrics: "85%",
      icon: BarChart,
      resolutionType: t('forClients.uc3Res', "Feedback Collection")
    },
    {
      title: t('forClients.uc4Title', "Lead Qualification"),
      description: t('forClients.uc4Desc', "Evaluate and score leads through detailed conversations to identify sales-ready opportunities."),
      channels: ["Phone", "Live Chat", "Video"],
      metrics: "40%",
      icon: Target,
      resolutionType: t('forClients.uc4Res', "Qualified Lead")
    },
    {
      title: t('forClients.uc5Title', "Information Requests"),
      description: t('forClients.uc5Desc', "Handle product inquiries, pricing questions, and service information requests across all channels."),
      channels: ["Live Chat", "Email", "Phone"],
      metrics: "92%",
      icon: MessageSquare,
      resolutionType: t('forClients.uc5Res', "Information Delivery")
    },
    {
      title: t('forClients.uc6Title', "Product Demonstrations"),
      description: t('forClients.uc6Desc', "Guide prospects through personalized product demos and feature explanations."),
      channels: ["Video", "Live Chat", "Screen Share"],
      metrics: "45%",
      icon: Video,
      resolutionType: t('forClients.uc6Res', "Demo Completion")
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
    { name: "Morocco", region: "Middle East & Africa" },
    { name: "UAE", region: "Middle East & Africa" }
  ];

  return (
    <div className="pt-8 pb-12">
      <div className="relative overflow-hidden bg-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('forClients.title', 'Transform Your Customer Experience')}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t('forClients.subtitle', 'Unlock exceptional customer service with our Transaction-as-a-Service platform. Only pay for successful resolutions.')}
            </p>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="group"
            >
              {t('forClients.getStarted', 'Get Started')}
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
            <h2 className="text-3xl font-bold text-center mb-4">{t('forClients.useCasesTitle', 'Resolution-Based Use Cases')}</h2>
            <p className="text-center text-gray-600 mb-12">
              {t('forClients.useCasesDesc', 'Explore how HARX delivers measurable results across various customer interactions')}
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
                      {t('forClients.resolution', 'Resolution:')} {useCase.resolutionType}
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
            <h2 className="text-3xl font-bold text-center mb-8">{t('forClients.globalPresence', 'Our Global Presence')}</h2>
            <p className="text-center text-gray-600 mb-12">
              {t('forClients.globalDesc', 'Currently operating in major markets across North America, Europe, Africa, and the Middle East, with more regions coming soon.')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { key: 'North America', label: t('forClients.na', 'North America') },
                { key: 'Europe', label: t('forClients.eu', 'Europe') },
                { key: 'Middle East & Africa', label: t('forClients.mea', 'Middle East & Africa') }
              ].map((region) => (
                <div key={region.key} className="bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4">{region.label}</h3>
                  <ul className="space-y-2">
                    {operationalCountries
                      .filter(country => country.region === region.key)
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
              {t('forClients.additionalMarkets', 'Additional markets coming soon to serve you better.')}
            </p>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">{t('forClients.ready', 'Ready to Get Started?')}</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="group"
              >
                {t('forClients.getStarted', 'Get Started')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={bookDemo}
                className="group"
              >
                {t('forClients.bookDemo', 'Book a Demo')}
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

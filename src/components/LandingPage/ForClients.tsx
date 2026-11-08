import React from 'react';
import { ArrowRight, BarChart, Shield, Phone, MessageSquare, Video, CheckCircle2, Target } from 'lucide-react';
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

  return (
    <div className="pt-8 pb-12">
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Use Cases */}
          <div className="max-w-6xl mx-auto mb-24">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-4 text-white">{t('forClients.useCasesTitle', 'Resolution-Based Use Cases')}</h2>
            <p className="text-center text-slate-300 mb-12">
              {t('forClients.useCasesDesc', 'Explore how HARX delivers measurable results across various customer interactions')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <div key={index} className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 shadow-xl shadow-black/30 backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-harx rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-harx-500/20">
                    <useCase.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{useCase.title}</h3>
                  <p className="text-slate-300 mb-4">{useCase.description}</p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-slate-400">
                      <Shield className="h-4 w-4 mr-2 text-harx-300" />
                      {t('forClients.resolution', 'Resolution:')} {useCase.resolutionType}
                    </div>
                    <div className="flex items-center text-sm text-slate-400">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" />
                      {useCase.metrics}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {useCase.channels.map((channel, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-harx-500/20 text-harx-200 rounded-full text-xs font-semibold"
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

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-black mb-6 text-white">{t('forClients.ready', 'Ready to Get Started?')}</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="group"
              >
                {t('forClients.getStarted', 'Get Started')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <button type="button" onClick={bookDemo} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-6 text-base font-bold text-white transition-colors hover:bg-white/10">
                {t('forClients.bookDemo', 'Book a Demo')}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-harx-500/10 rounded-full blur-3xl -z-10" />
      </div>
    </div>
  );
}

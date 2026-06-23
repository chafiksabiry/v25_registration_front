import React from 'react';
import { ArrowRight, Brain, LineChart, Sparkles, Users2, Bot, Gauge, MessageSquare, Shield, Zap, Globe } from 'lucide-react';
import { Button } from './Button';

interface FeaturesProps {
  onGetStarted: () => void;
}

export function Features({ onGetStarted }: FeaturesProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-b from-white via-harx-50/30 to-white py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            AI-Powered Excellence in Customer Engagement
          </h2>
          <p className="text-xl text-gray-600">
            Experience the perfect blend of human expertise and artificial intelligence,
            delivering exceptional customer experiences at scale.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* AI Everywhere Section */}
          <div className="rounded-xl border border-harx-100 bg-gradient-to-br from-white to-harx-50/50 p-8 shadow-lg transition-transform duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-harx rounded-xl flex items-center justify-center mb-6">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">AI Everywhere</h3>
            <p className="text-gray-600 mb-6">
              Our intelligent system permeates every aspect of customer service,
              ensuring consistent, data-driven excellence across all touchpoints.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Automated Call Summarization</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Automated quality monitoring</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Smart knowledge base</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Intelligent Workflow Automation</span>
              </li>
            </ul>
          </div>

          {/* AI Augmented Agents Section */}
          <div className="rounded-xl border border-harx-100 bg-gradient-to-br from-white to-harx-50/50 p-8 shadow-lg transition-transform duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-harx rounded-xl flex items-center justify-center mb-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">AI Augmented Agents</h3>
            <p className="text-gray-600 mb-6">
              Empower your human workforce with AI-driven insights and tools,
              maximizing efficiency while maintaining the human touch.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Real-time decision support</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Real-Time Conversation Guidance</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Continuous Agent Learning</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Contextual recommendations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Secondary Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Predictive Analytics */}
          {/* <div className="rounded-xl border border-harx-100 bg-gradient-to-br from-white to-harx-50/50 p-8 shadow-lg transition-transform duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-harx rounded-lg flex items-center justify-center mb-6">
              <LineChart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Predictive Analytics</h3>
            <p className="text-gray-600 mb-6">
              Leverage advanced analytics to forecast customer behaviors and optimize
              service delivery proactively.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Demand forecasting</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Behavior analysis</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Trend identification</span>
              </li>
            </ul>
          </div> */}

          {/* Real-Time Optimization */}
          {/* <div className="rounded-xl border border-harx-100 bg-gradient-to-br from-white to-harx-50/50 p-8 shadow-lg transition-transform duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-harx rounded-lg flex items-center justify-center mb-6">
              <Gauge className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Real-Time Optimization</h3>
            <p className="text-gray-600 mb-6">
              Continuously analyze and adjust service strategies on the fly,
              ensuring optimal performance and customer satisfaction.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Dynamic resource allocation</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Performance monitoring</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Real-time adjustments</span>
              </li>
            </ul>
          </div> */}

          {/* Intelligent Automation */}
          {/* <div className="rounded-xl border border-harx-100 bg-gradient-to-br from-white to-harx-50/50 p-8 shadow-lg transition-transform duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-harx rounded-lg flex items-center justify-center mb-6">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Intelligent Automation</h3>
            <p className="text-gray-600 mb-6">
              Automate routine tasks while maintaining the human touch where it matters most.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Smart response suggestions</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Automated ticket categorization</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                <span>Workflow automation</span>
              </li>
            </ul>
          </div> */}
        </div>

        {/* Technology Showcase */}
        {/* <div className="relative mt-24 overflow-hidden rounded-2xl border border-harx-200 bg-gradient-to-br from-harx-50 via-white to-harx-alt-50 p-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Cutting-Edge AI Technology</h3>
            <p className="text-gray-600">
              Our platform combines multiple AI technologies to deliver superior customer service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="rounded-xl border border-harx-100 bg-gradient-to-br from-white to-harx-50/80 p-6 shadow-lg backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-harx rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Natural Language Processing</h4>
              <p className="text-gray-600">Understanding customer intent and sentiment in real-time</p>
            </div>
            <div className="rounded-xl border border-harx-100 bg-gradient-to-br from-white to-harx-50/80 p-6 shadow-lg backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-harx rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Machine Learning</h4>
              <p className="text-gray-600">Continuously improving service through pattern recognition</p>
            </div>
            <div className="rounded-xl border border-harx-100 bg-gradient-to-br from-white to-harx-50/80 p-6 shadow-lg backdrop-blur-sm">
              <div className="w-12 h-12 bg-gradient-harx rounded-lg flex items-center justify-center mb-4">
                <Users2 className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Predictive Analytics</h4>
              <p className="text-gray-600">Anticipating customer needs before they arise</p>
            </div>
          </div>

          <div className="absolute inset-0 opacity-10">
            <img
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80"
              alt="Technology background"
              className="w-full h-full object-cover"
            />
          </div>
        </div> */}
      </div>
    </section>
  );
}

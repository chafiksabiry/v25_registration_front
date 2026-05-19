import React from 'react';
import { Button } from './Button';
import { ArrowRight, Globe, Headphones, Users2, Clock, DollarSign, Shield, Heart, Brain, Sparkles, Target, BarChart, Bot, Zap, Phone, Mail, MessageSquare, Video, BookOpen, CheckCircle2, Coins, Eye } from 'lucide-react';
import harxMascotte from './assets/harx-mascotte.webp';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const bookDemo = () => {
    window.open('https://harxtechnologies.zohobookings.com/#/WebsiteBooking', '_blank');
  };

  return (
    <div className="relative min-h-screen pt-16 overflow-hidden bg-gradient-to-b from-harx-50 to-white">
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <span className="inline-block px-4 py-2 rounded-full bg-gradient-harx text-white text-sm font-semibold mb-4">
              AI-Powered Contact Center • 60,000+ Expert Agents • Transaction-as-a-Service
            </span>
          </div>

          {/* AI Mascot */}
          <div className="relative w-full max-w-md mx-auto mb-8">
            <img
              src={harxMascotte}
              alt="HARX Mascotte"
              className="w-full h-auto object-contain"
              loading="eager"
            />
            <div className="absolute -inset-4 bg-gradient-to-r from-harx-400/20 to-harx-600/20 rounded-lg blur-lg -z-10" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 flex flex-col gap-4">
            <span className="bg-clip-text text-transparent bg-gradient-harx">
              AI-Powered Contact Centre
            </span>
            <span className="text-4xl md:text-5xl text-gray-600">
              Meets
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-harx-alt-500 to-harx-500">
              Transaction-as-a-Service
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Revolutionize your customer service with our AI-powered platform. Experience seamless
            operations where you define success, set your pricing, and only pay for resolved
            transactions. Our intelligent system combines human expertise with AI precision for
            unmatched service quality.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="bg-gradient-harx hover:opacity-90 active:opacity-100"
              onClick={onGetStarted}
            >
              Experience AI-Powered Service
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2"
              onClick={bookDemo}
            >
              Book a Demo
            </Button>
          </div>

          {/* Value Propositions */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* AI Technology */}
            <div className="bg-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 flex flex-col">
              <div className="w-16 h-16 bg-gradient-harx rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Advanced AI Technology</h3>
              <ul className="space-y-4 text-left flex-grow">
                <li className="flex items-start">
                  <Bot className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                  <span>AI-augmented agents with real-time decision support</span>
                </li>
                <li className="flex items-start">
                  <Eye className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Continuous quality assurance monitored by AI</span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Performance optimization through AI coaching</span>
                </li>
                <li className="flex items-start">
                  <Target className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Intelligent matching of customer needs with expert agents</span>
                </li>
                <li className="flex items-start">
                  <BookOpen className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                  <span>AI Engine for Knowledge Base management</span>
                </li>
              </ul>
              <div className="mt-8 pt-4 border-t border-gray-100">
                <Button className="w-full" onClick={() => scrollToSection('features')}>
                  Explore AI Features
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* TaaS Platform */}
            <div className="bg-white p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 flex flex-col">
              <div className="w-16 h-16 bg-gradient-harx rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Transaction-as-a-Service</h3>
              <ul className="space-y-4 text-left flex-grow">
                <li className="flex items-start">
                  <Coins className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                  <span>You set the price per successful transaction</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Only pay when you approve completed transactions</span>
                </li>
                <li className="flex items-start">
                  <DollarSign className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                  <span>Commission released upon transaction approval</span>
                </li>
                <li className="flex flex-col space-y-2">
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 text-harx-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Complete omnichannel support:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-7">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-harx-100 text-harx-800">
                      <Phone className="h-3 w-3 mr-1" />
                      Calls
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-harx-100 text-harx-800">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-harx-100 text-harx-800">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Live Chat
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-harx-100 text-harx-800">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </span>
                  </div>
                </li>
              </ul>
              <div className="mt-8 pt-4 border-t border-gray-100">
                <Button className="w-full" onClick={() => scrollToSection('how-it-works')}>
                  See How It Works
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-16">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-harx-500" />
              <span>GDPR Compliant</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-harx rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-First Platform</h3>
              <p className="text-gray-600">Cutting-edge artificial intelligence</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-harx rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">60,000+ AI-Enhanced Agents</h3>
              <p className="text-gray-600">Powered by intelligent technology</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-harx rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global AI Network</h3>
              <p className="text-gray-600">Intelligent service worldwide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-harx-400/10 via-harx-alt-400/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gradient-radial from-harx-alt-300/10 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-harx-200/10 to-transparent rounded-full blur-3xl -z-10" />
    </div>
  );
}

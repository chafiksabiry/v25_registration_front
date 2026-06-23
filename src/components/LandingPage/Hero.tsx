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
    <div className="relative min-h-screen pt-24 overflow-hidden bg-space-dark-default text-white">
      {/* Background glowing decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-harx-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-harx-alt-500/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-harx-500/5 via-transparent to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 pt-16 pb-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 animate-fade-in">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-slate-200 text-sm font-semibold mb-4 hover:border-harx-400/50 transition-all duration-300">
              <Sparkles className="h-4 w-4 text-harx-400" />
              AI-Powered Contact Center • 60,000+ Expert Agents • Transaction-as-a-Service
            </span>
          </div>

          {/* AI Mascot Floating & Glowing */}
          <div className="relative w-full max-w-[280px] md:max-w-[320px] mx-auto mb-10 group">
            <div className="absolute -inset-4 bg-gradient-to-r from-harx-500/20 to-harx-alt-500/20 rounded-full blur-2xl group-hover:from-harx-500/30 group-hover:to-harx-alt-500/30 transition-all duration-500" />
            <img
              src={harxMascotte}
              alt="HARX Mascotte"
              className="w-full h-auto object-contain relative z-10 animate-float drop-shadow-[0_15px_30px_rgba(255,77,77,0.15)]"
              loading="eager"
            />
          </div>

          <h1 className="text-4xl sm:text-4xl md:text-7xl font-extrabold tracking-tight mb-4 flex flex-col gap-2">
            <span className="bg-clip-text text-transparent bg-gradient-harx whitespace-nowrap">
              AI-Powered Customer Engagement
            </span>
            <span className="text-2xl sm:text-3xl text-slate-400 font-semibold tracking-wider uppercase my-1">
              Meets
            </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-harx-alt-400 to-harx-400">
              Transaction-as-a-Service
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-350 mb-10 max-w-3xl mx-auto leading-relaxed">
          Stop paying for seats. Start paying for results. <br /> 
          Harx connects your business to a global network of certified agents — human or AI — who handle your customer engagement end to end. Every interaction is scored in real time. You only pay when the result you defined is delivered. <br />
          Revolutionize your customer service with our AI-powered platform. Experience seamless
            operations where you define success, set your pricing, and only pay for resolved
            transactions. Our intelligent system combines human expertise with AI precision for
            unmatched service quality.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Button
              size="lg"
              className="h-12 px-6 bg-gradient-harx hover:opacity-95 text-white font-semibold shadow-lg shadow-harx-500/20 hover:shadow-harx-500/35 transition-all duration-300"
              onClick={onGetStarted}
            >
              Experience AI-Powered Service
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 border border-white/10 hover:border-harx-500 bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all duration-300"
              onClick={bookDemo}
            >
              Book a Demo
            </Button>
          </div>

          {/* Value Propositions */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {/* AI Technology */}
            <div className="glass-card-premium p-8 rounded-2xl flex flex-col hover:border-harx-500/30 transition-all duration-500 group">
              <div className="w-14 h-14 bg-gradient-harx rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-harx-500/10">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-[0_1px_8px_rgba(255,77,77,0.25)]">Advanced AI Technology</h3>
              <ul className="space-y-4 text-left flex-grow text-slate-200">
                <li className="flex items-start">
                  <Bot className="h-5 w-5 text-harx-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>AI-augmented agents with real-time decision support</span>
                </li>
                <li className="flex items-start">
                  <Eye className="h-5 w-5 text-harx-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Continuous quality assurance monitored by AI</span>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-harx-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Performance optimization through AI coaching</span>
                </li>
                <li className="flex items-start">
                  <Target className="h-5 w-5 text-harx-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Intelligent matching of customer needs with expert agents</span>
                </li>
                <li className="flex items-start">
                  <BookOpen className="h-5 w-5 text-harx-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>AI Engine for Knowledge Base management</span>
                </li>
              </ul>
              <div className="mt-8 pt-6 border-t border-harx-500/20">
                <Button className="w-full h-11 bg-gradient-to-r from-harx-500/30 to-harx-alt-500/25 border border-harx-400/40 hover:border-harx-300 hover:from-harx-500/45 hover:to-harx-alt-500/35 text-white font-semibold shadow-lg shadow-harx-500/20 transition-all duration-300" onClick={() => scrollToSection('features')}>
                  Explore AI Features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* TaaS Platform */}
            <div className="glass-card-premium p-8 rounded-2xl flex flex-col hover:border-harx-alt-500/30 transition-all duration-500 group">
              <div className="w-14 h-14 bg-gradient-harx rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-harx-500/10">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-[0_1px_8px_rgba(236,72,153,0.25)]">Transaction-as-a-Service</h3>
              <ul className="space-y-4 text-left flex-grow text-slate-200">
                <li className="flex items-start">
                  <Coins className="h-5 w-5 text-harx-alt-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>You set the price per successful transaction</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-harx-alt-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Only pay when you approve completed transactions</span>
                </li>
                <li className="flex items-start">
                  <DollarSign className="h-5 w-5 text-harx-alt-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span>Commission released upon transaction approval</span>
                </li>
                <li className="flex flex-col space-y-2">
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 text-harx-alt-400 mt-0.5 mr-3 flex-shrink-0" />
                    <span>Complete omnichannel support:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-8">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-harx-950/40 border border-harx-800/40 text-harx-300">
                      <Phone className="h-3 w-3 mr-1" />
                      Calls
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-harx-950/40 border border-harx-800/40 text-harx-300">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-harx-950/40 border border-harx-800/40 text-harx-300">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Live Chat
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-harx-950/40 border border-harx-800/40 text-harx-300">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </span>
                  </div>
                </li>
              </ul>
              <div className="mt-8 pt-6 border-t border-harx-alt-500/20">
                <Button className="w-full h-11 bg-gradient-to-r from-harx-alt-500/30 to-harx-500/25 border border-harx-alt-400/40 hover:border-harx-alt-300 hover:from-harx-alt-500/45 hover:to-harx-500/35 text-white font-semibold shadow-lg shadow-harx-alt-500/20 transition-all duration-300" onClick={() => scrollToSection('how-it-works')}>
                  See How It Works
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 text-sm text-harx-200 mb-16">
            <div className="flex items-center gap-2 px-4 py-2 bg-harx-500/10 border border-harx-500/30 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-harx-400" />
              <span>GDPR Compliant & Encrypted Data</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 glass-card-premium rounded-2xl hover:border-harx-500/50 transition-colors">
              <div className="w-11 h-11 bg-gradient-harx rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md shadow-harx-500/20">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-1">AI-First Platform</h3>
              <p className="text-sm text-harx-200">Cutting-edge artificial intelligence</p>
            </div>
            <div className="p-6 glass-card-premium rounded-2xl hover:border-harx-alt-500/50 transition-colors">
              <div className="w-11 h-11 bg-gradient-harx rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md shadow-harx-500/20">
                <Users2 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-1">60,000+ AI-Enhanced Agents</h3>
              <p className="text-sm text-harx-200">Powered by intelligent technology</p>
            </div>
            <div className="p-6 glass-card-premium rounded-2xl hover:border-harx-500/50 transition-colors">
              <div className="w-11 h-11 bg-gradient-harx rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md shadow-harx-500/20">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-1">Global AI Network</h3>
              <p className="text-sm text-harx-200">Intelligent service worldwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

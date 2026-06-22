import React, { useState } from 'react';
import {
  Building2,
  Users,
  ArrowRight,
  Headphones,
  PhoneCall,
  MessagesSquare,
  Phone,
  HeadphonesIcon,
  Target,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Header } from './LandingPage/Header';
import companyBanner from './assets/choice-company.jpg';
import repBanner from './assets/choice-rep.jpg';

interface ChoicePageProps {
  onSelectRole: (role: 'company' | 'rep') => void;
  onSignIn: () => void;
  onNavigateToSection?: (sectionId: string) => void;
}

const companyFeatures = [
  { icon: HeadphonesIcon, label: 'Customer Service Representatives' },
  { icon: PhoneCall, label: 'Telesales Professionals' },
  { icon: MessagesSquare, label: 'Live Chat Support Agents' },
  { icon: Target, label: 'Technical Support Specialists' },
];

const repFeatures = [
  { icon: Building2, label: 'Work with Leading Companies' },
  { icon: Phone, label: 'Remote Opportunities Available' },
  { icon: Headphones, label: 'Flexible Scheduling Options' },
  { icon: Users, label: 'Join Professional Communities' },
];

export default function ChoicePage({ onSelectRole, onSignIn, onNavigateToSection }: ChoicePageProps) {
  const [companyLoaded, setCompanyLoaded] = useState(false);
  const [repLoaded, setRepLoaded] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-harx-50 via-white to-harx-alt-50/60 flex flex-col animate-fade-in relative">
      {/* Decorative background blobs — pure CSS, render instantly */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-harx-300/30 blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-harx-alt-300/30 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-harx-400/20 blur-3xl animate-pulse-slow" />
      </div>

      {/* Navbar */}
      <Header onSignIn={onSignIn} onGetStarted={() => {}} onNavigateToSection={onNavigateToSection} />

      {/* Hero */}
      <div className="relative z-10 pt-24 pb-6 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-harx-100 shadow-sm mb-4">
          <Sparkles className="w-4 h-4 text-harx-500" />
          <span className="text-xs font-bold tracking-wide text-harx-600 uppercase">HARX Marketplace</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
          Transform Your{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-harx-500 via-harx-alt-500 to-harx-600">
            Contact Center
          </span>
        </h1>
        <p className="mt-3 text-sm md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Connect with opportunities or find the perfect talent for your customer service needs.
        </p>
      </div>

      {/* Cards */}
      <div className="relative z-10 flex-1 container mx-auto px-4 pb-10 flex items-start md:items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl w-full mx-auto">
          {/* Company Card — désactivé temporairement */}
          <div
            aria-disabled="true"
            className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 opacity-55 grayscale backdrop-blur shadow-xl shadow-slate-300/10 pointer-events-none select-none"
          >
            <div className="absolute inset-x-0 top-0 z-20 h-1.5 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400" />
            {/* Banner: brand gradient always visible instantly, photo fades in on top */}
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-harx-600 via-harx-500 to-harx-alt-500">
              <img
                src={companyBanner}
                alt="Team collaborating in an office"
                loading="eager"
                decoding="async"
                onLoad={() => setCompanyLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:scale-105 ${companyLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
              {/* Brand color tint for readability + identity */}
              <div className="absolute inset-0 bg-gradient-to-t from-harx-700/90 via-harx-600/45 to-harx-500/20" />
              <div className="absolute bottom-4 left-5 right-5 z-10">
                <div className="inline-flex p-2 rounded-xl bg-white/20 backdrop-blur-sm mb-2 ring-1 ring-white/30">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-sm">Post a Gig</h2>
                <p className="text-white/90 text-sm font-medium">For companies seeking customer service talent</p>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {companyFeatures.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center text-slate-700">
                    <div className="p-1.5 bg-harx-50 rounded-lg mr-3">
                      <Icon className="w-4 h-4 text-harx-600" />
                    </div>
                    <span className="font-semibold text-sm">{label}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled
                className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-slate-300 px-6 py-3.5 font-bold text-slate-500"
              >
                Post a Gig
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Professional Card */}
          <div className="group relative bg-white/90 backdrop-blur rounded-3xl shadow-xl shadow-harx-alt-500/5 hover:shadow-2xl hover:shadow-harx-alt-500/20 transition-all duration-500 transform hover:-translate-y-1.5 border border-harx-alt-100/70 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 z-20 bg-gradient-to-r from-harx-alt-400 via-harx-alt-500 to-harx-alt-600" />
            {/* Banner: brand gradient always visible instantly, photo fades in on top */}
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-harx-alt-500 via-harx-alt-600 to-harx-600">
              <img
                src={repBanner}
                alt="Contact center professionals at work"
                loading="eager"
                decoding="async"
                onLoad={() => setRepLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:scale-105 ${repLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
              {/* Brand color tint for readability + identity */}
              <div className="absolute inset-0 bg-gradient-to-t from-harx-alt-700/90 via-harx-alt-600/45 to-harx-alt-500/20" />
              <div className="absolute bottom-4 left-5 right-5 z-10">
                <div className="inline-flex p-2 rounded-xl bg-white/20 backdrop-blur-sm mb-2 ring-1 ring-white/30">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-sm">Find Gigs</h2>
                <p className="text-white/90 text-sm font-medium">For contact center professionals</p>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {repFeatures.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center text-slate-700">
                    <div className="p-1.5 bg-harx-alt-50 rounded-lg mr-3">
                      <Icon className="w-4 h-4 text-harx-alt-600" />
                    </div>
                    <span className="font-semibold text-sm">{label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onSelectRole('rep')}
                className="mt-6 w-full bg-gradient-to-r from-harx-alt-500 to-harx-alt-600 text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-harx-alt-500/40 active:scale-[0.98]"
              >
                Find Gigs
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust footer line */}
      <div className="relative z-10 pb-6 px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-harx-500" /> No setup fees
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-harx-500" /> Verified professionals
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-harx-500" /> AI-powered matching
          </span>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
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
  Briefcase,
  Search,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Header } from './LandingPage/Header';

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
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/60 flex flex-col animate-fade-in relative">
      {/* Decorative background blobs — pure CSS, render instantly */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-300/30 blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-emerald-300/30 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-violet-300/20 blur-3xl animate-pulse-slow" />
      </div>

      {/* Navbar */}
      <Header onSignIn={onSignIn} onGetStarted={() => {}} onNavigateToSection={onNavigateToSection} />

      {/* Hero */}
      <div className="relative z-10 pt-24 pb-6 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-slate-200 shadow-sm mb-4">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold tracking-wide text-slate-600 uppercase">HARX Marketplace</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
          Transform Your{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500">
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
          {/* Company Card */}
          <div className="group relative bg-white/90 backdrop-blur rounded-3xl shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 transform hover:-translate-y-1.5 border border-slate-100 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
            {/* Banner (gradient, no image) */}
            <div className="relative h-36 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 overflow-hidden">
              <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute right-4 top-4 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500">
                <Briefcase className="w-24 h-24 text-white" strokeWidth={1.2} />
              </div>
              <div className="absolute bottom-4 left-5 right-5">
                <div className="inline-flex p-2 rounded-xl bg-white/20 backdrop-blur-sm mb-2">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">Post a Gig</h2>
                <p className="text-white/80 text-sm font-medium">For companies seeking customer service talent</p>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {companyFeatures.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center text-slate-700">
                    <div className="p-1.5 bg-indigo-50 rounded-lg mr-3">
                      <Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-semibold text-sm">{label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onSelectRole('company')}
                className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98]"
              >
                Post a Gig
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Professional Card */}
          <div className="group relative bg-white/90 backdrop-blur rounded-3xl shadow-xl shadow-emerald-500/5 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 transform hover:-translate-y-1.5 border border-slate-100 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
            {/* Banner (gradient, no image) */}
            <div className="relative h-36 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 overflow-hidden">
              <div className="absolute -right-6 -top-6 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute right-4 top-4 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500">
                <Search className="w-24 h-24 text-white" strokeWidth={1.2} />
              </div>
              <div className="absolute bottom-4 left-5 right-5">
                <div className="inline-flex p-2 rounded-xl bg-white/20 backdrop-blur-sm mb-2">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">Find Gigs</h2>
                <p className="text-white/80 text-sm font-medium">For contact center professionals</p>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {repFeatures.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center text-slate-700">
                    <div className="p-1.5 bg-emerald-50 rounded-lg mr-3">
                      <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="font-semibold text-sm">{label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onSelectRole('rep')}
                className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/40 active:scale-[0.98]"
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
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No setup fees
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified professionals
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI-powered matching
          </span>
        </div>
      </div>
    </div>
  );
}

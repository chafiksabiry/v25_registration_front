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
  Sparkles,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { Header } from './LandingPage/Header';
import companyBanner from './assets/choice-company.jpg';
import repBanner from './assets/choice-rep.jpg';
import { useTranslation } from 'react-i18next';

export type SignupUserType = 'company' | 'rep' | 'call-center';

interface ChoicePageProps {
  onSelectRole: (role: SignupUserType) => void;
  onSignIn: () => void;
  onNavigateToSection?: (sectionId: string) => void;
}

const callCenterFeatures = [
  { icon: HeadphonesIcon, labelKey: 'choicePage.ccFeat1', defaultLabel: 'Manage call-center operations' },
  { icon: PhoneCall, labelKey: 'choicePage.ccFeat2', defaultLabel: 'Run outbound & inbound campaigns' },
  { icon: Users, labelKey: 'choicePage.ccFeat3', defaultLabel: 'Staff agents and supervisors' },
  { icon: Target, labelKey: 'choicePage.ccFeat4', defaultLabel: 'Track performance & quality' },
];

const companyFeatures = [
  { icon: HeadphonesIcon, labelKey: 'choicePage.companyFeat1', defaultLabel: 'Customer Service Representatives' },
  { icon: PhoneCall, labelKey: 'choicePage.companyFeat2', defaultLabel: 'Telesales Professionals' },
  { icon: MessagesSquare, labelKey: 'choicePage.companyFeat3', defaultLabel: 'Live Chat Support Agents' },
  { icon: Target, labelKey: 'choicePage.companyFeat4', defaultLabel: 'Technical Support Specialists' },
];

const repFeatures = [
  { icon: Building2, labelKey: 'choicePage.repFeat1', defaultLabel: 'Work with Leading Companies' },
  { icon: Phone, labelKey: 'choicePage.repFeat2', defaultLabel: 'Remote Opportunities Available' },
  { icon: Headphones, labelKey: 'choicePage.repFeat3', defaultLabel: 'Flexible Scheduling Options' },
  { icon: Users, labelKey: 'choicePage.repFeat4', defaultLabel: 'Join Professional Communities' },
];

type Feature = { icon: LucideIcon; id: string; label: string };

function ChoiceCard({
  title,
  description,
  badge,
  badgeTone,
  icon: Icon,
  image,
  imageAlt,
  features,
  cta,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  badge: string;
  badgeTone: 'muted' | 'live';
  icon: LucideIcon;
  image: string;
  imageAlt: string;
  features: Feature[];
  cta: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const interactive = Boolean(onClick) && !disabled;

  return (
    <article
      onClick={interactive ? onClick : undefined}
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-lg ${
        interactive
          ? 'cursor-pointer border-rose-100 shadow-rose-500/10 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl'
          : 'border-slate-200/80'
      }`}
    >
      <div className="relative h-52 shrink-0 overflow-hidden">
        <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
        <div className={`absolute inset-0 ${disabled ? 'bg-slate-900/55' : 'bg-gradient-to-t from-rose-950/80 via-rose-700/45 to-rose-500/15'}`} />
        <div className="absolute inset-x-5 bottom-4 flex flex-col">
          <div className="mb-2 inline-flex w-fit rounded-xl bg-white/20 p-2 ring-1 ring-white/30">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <h2 className="line-clamp-2 min-h-[3.5rem] text-2xl font-black leading-tight text-white">{title}</h2>
          <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-white/90">{description}</p>
          <span
            className={`mt-2 inline-flex h-6 w-fit items-center rounded-full px-3 text-[11px] font-bold uppercase tracking-wide ${
              badgeTone === 'live' ? 'bg-white text-rose-600' : 'bg-white/20 text-white'
            }`}
          >
            {badge}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <ul className="flex-1 space-y-2">
          {features.map(({ icon: FeatureIcon, id, label }) => (
            <li key={id} className="flex min-h-10 items-center text-slate-700">
              <span className={`mr-3 inline-flex shrink-0 rounded-lg p-1.5 ${disabled ? 'bg-slate-100' : 'bg-rose-50'}`}>
                <FeatureIcon className={`h-4 w-4 ${disabled ? 'text-slate-500' : 'text-rose-600'}`} />
              </span>
              <span className="text-sm font-semibold leading-snug">{label}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={disabled}
          aria-disabled={disabled || undefined}
          className={`mt-6 flex h-14 w-full shrink-0 items-center justify-center gap-2 rounded-2xl px-4 text-center text-sm font-bold leading-tight ${
            disabled
              ? 'cursor-not-allowed bg-slate-200 text-slate-500'
              : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-rose-500/40 active:scale-[0.98]'
          }`}
        >
          {cta}
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </article>
  );
}

export default function ChoicePage({ onSelectRole, onSignIn, onNavigateToSection }: ChoicePageProps) {
  const { t } = useTranslation();

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
          <span className="text-xs font-bold tracking-wide text-harx-600 uppercase">{t('choicePage.marketplace', 'HARX Marketplace')}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
          {t('choicePage.title1', 'Transform Your')}{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-harx-500 via-harx-alt-500 to-harx-600">
            {t('choicePage.title2', 'Contact Center')}
          </span>
        </h1>
        <p className="mt-3 text-sm md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {t('choicePage.subtitle', 'Connect with opportunities or find the perfect talent for your customer service needs.')}
        </p>
      </div>

      {/* Cards */}
      <div className="relative z-10 flex-1 container mx-auto px-4 pb-12">
        <div className="mx-auto grid w-full max-w-6xl items-stretch gap-6 lg:grid-cols-3">
          <ChoiceCard
            disabled
            icon={Building2}
            image={companyBanner}
            imageAlt="Équipe en entreprise"
            title={t('choicePage.companyTitle', 'Post a Gig')}
            description={t('choicePage.companyDesc', 'For companies seeking customer service talent')}
            badge={t('choicePage.comingSoon', 'Coming soon')}
            badgeTone="muted"
            features={companyFeatures.map(({ icon, labelKey, defaultLabel }) => ({ icon, id: labelKey, label: t(labelKey, defaultLabel) }))}
            cta={t('choicePage.companyTitle', 'Post a Gig')}
          />
          <ChoiceCard
            disabled
            icon={HeadphonesIcon}
            image={companyBanner}
            imageAlt="Centre d'appels"
            title={t('choicePage.callCenterTitle', 'Call Center')}
            description={t('choicePage.callCenterDesc', 'For call centers running campaigns and agents')}
            badge={t('choicePage.comingSoon', 'Coming soon')}
            badgeTone="muted"
            features={callCenterFeatures.map(({ icon, labelKey, defaultLabel }) => ({ icon, id: labelKey, label: t(labelKey, defaultLabel) }))}
            cta={t('choicePage.callCenterCta', 'Join as Call Center')}
          />
          <ChoiceCard
            icon={Headphones}
            image={repBanner}
            imageAlt="Professionnels en centre de contact"
            title={t('choicePage.repTitle', 'Find Gigs')}
            description={t('choicePage.repDesc', 'For contact center professionals')}
            badge={t('choicePage.available', 'Available')}
            badgeTone="live"
            features={repFeatures.map(({ icon, labelKey, defaultLabel }) => ({ icon, id: labelKey, label: t(labelKey, defaultLabel) }))}
            cta={t('choicePage.repTitle', 'Find Gigs')}
            onClick={() => onSelectRole('rep')}
          />
        </div>
      </div>

      {/* Trust footer line */}
      <div className="relative z-10 pb-6 px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-harx-500" /> {t('choicePage.trust1', 'No setup fees')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-harx-500" /> {t('choicePage.trust2', 'Verified professionals')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-harx-500" /> {t('choicePage.trust3', 'AI-powered matching')}
          </span>
        </div>
      </div>
    </div>
  );
}

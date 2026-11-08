import React, { useLayoutEffect, useRef } from 'react';
import { ArrowRight, Building2, Headphones, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import harxMascotte from '../LandingPage/assets/harx-mascotte.webp';
import companyBanner from '../assets/choice-company.jpg';
import repBanner from '../assets/choice-rep.jpg';
import { TAAS_COMPANY, TAAS_REPS } from '../../lib/taasPaths';

/** Accueil TAAS : tout tient dans un écran (message, puis deux portes vers l'espace COMPANY et l'espace REPS). */
export function TaasHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);

  // Le grand titre s'ajuste à la largeur ET à la hauteur de l'écran pour que la page ne défile pas.
  useLayoutEffect(() => {
    const container = titleContainerRef.current;
    const text = titleTextRef.current;
    if (!container || !text) return;
    const fitTitle = () => {
      const cap = Math.max(26, Math.min(72, Math.round(window.innerHeight * 0.075)));
      let size = cap;
      text.style.fontSize = `${size}px`;
      const limit = container.clientWidth;
      while (text.scrollWidth > limit && size > 12) {
        size -= 1;
        text.style.fontSize = `${size}px`;
      }
    };
    fitTitle();
    const observer = new ResizeObserver(fitTitle);
    observer.observe(container);
    window.addEventListener('resize', fitTitle);
    document.fonts?.ready.then(fitTitle).catch(() => undefined);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fitTitle);
    };
  }, []);

  const doors = [
    {
      id: 'company' as const,
      icon: Building2,
      image: companyBanner,
      tag: t('choicePage.companyTag', 'COMPANY'),
      title: t('taasHome.companyTitle', 'You need customer service professionals'),
      points: [t('taasHome.companyP1', 'You define the result and its price'), t('taasHome.companyP2', 'Professionals, human or AI, handle it'), t('taasHome.companyP3', 'You only pay for approved results')],
      cta: t('taasHome.companyCta', 'List your Gig'),
      path: TAAS_COMPANY,
      accent: 'from-harx-500 to-amber-400',
    },
    {
      id: 'reps' as const,
      icon: Headphones,
      image: repBanner,
      tag: t('choicePage.repTag', 'REPS'),
      title: t('taasHome.repsTitle', 'You are a customer service professional'),
      points: [t('taasHome.repsP1', 'Choose your missions and your hours'), t('taasHome.repsP2', 'Work from anywhere in the world'), t('taasHome.repsP3', 'Get paid for every result')],
      cta: t('taasHome.repsCta', 'Find a Gig'),
      path: TAAS_REPS,
      accent: 'from-harx-alt-500 to-violet-500',
    },
  ];

  return (
    <main className="taas-home relative flex flex-1 flex-col justify-center overflow-hidden bg-space-dark-default px-4 text-white" data-testid="taas-home">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-rose-600/20 blur-[130px]" />
        <div className="absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-fuchsia-600/20 blur-[130px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center text-center taas-home__stack">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur-md md:text-sm">
          <Sparkles className="h-4 w-4 shrink-0 text-harx-400" aria-hidden="true" />
          {t('hero.badge', 'AI-Powered • 60,000+ Expert Agents • Transaction-as-a-Service')}
        </span>

        <div className="relative taas-home__mascot-wrap">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-harx-500/25 to-harx-alt-500/25 blur-2xl" aria-hidden="true" />
          <img src={harxMascotte} alt="HARX Mascotte" className="taas-home__mascot relative z-10 w-auto object-contain drop-shadow-[0_15px_30px_rgba(255,77,77,0.15)]" loading="eager" />
        </div>

        <h1 className="flex w-full flex-col items-center font-extrabold tracking-tight">
          <div ref={titleContainerRef} className="flex w-full justify-center">
            <span ref={titleTextRef} className="bg-gradient-harx bg-clip-text text-transparent" style={{ whiteSpace: 'nowrap', lineHeight: 1.1 }}>
              {t('hero.title1', 'AI-Powered Customer Engagement')}
            </span>
          </div>
          <span className="taas-home__meets font-semibold uppercase tracking-wider text-slate-400">{t('hero.title2', 'Meets')}</span>
          <span className="taas-home__brand bg-gradient-to-r from-harx-alt-400 to-harx-400 bg-clip-text text-transparent">{t('hero.title3', 'Transaction-as-a-Service')}</span>
        </h1>

        <div className="taas-home__lines max-w-3xl text-slate-300">
          <p>{t('hero.desc1', 'Stop paying for seats. Start paying for results.')}</p>
          <p>{t('hero.desc2', 'Uber connects you to drivers.')} {t('hero.desc3', 'Airbnb connects you to homes.')}</p>
          <p>{t('hero.desc4', 'Harx connects you to agents — and charges you only when they deliver.')}</p>
        </div>

        <div className="taas-home__doors grid w-full max-w-4xl gap-4 md:grid-cols-2" data-testid="taas-doors">
          {doors.map(({ id, icon: Icon, image, tag, title, points, cta, path, accent }) => (
            <a
              key={id}
              href={path}
              data-testid={`taas-door-${id}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(path);
              }}
              className="taas-home__door group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-white/10 text-left shadow-2xl shadow-black/40 transition-transform duration-500 hover:-translate-y-1"
            >
              <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20" />
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
              <div className="relative z-10 p-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-widest backdrop-blur">
                  <Icon className="h-4 w-4" aria-hidden="true" /> {tag}
                </span>
                <h2 className="taas-home__door-title mt-2 font-black leading-tight">{title}</h2>
                <ul className="taas-home__points mt-2 space-y-1 text-sm font-semibold text-slate-200">
                  {points.map((p) => (
                    <li key={p} className="flex items-center gap-2"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-harx-400" />{p}</li>
                  ))}
                </ul>
                <span className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-harx px-5 text-sm font-bold text-white shadow-lg shadow-harx-500/30 transition-all group-hover:shadow-harx-500/50">
                  {cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}

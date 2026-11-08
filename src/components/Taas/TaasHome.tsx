import React, { useLayoutEffect, useRef } from 'react';
import { ArrowRight, Building2, Headphones, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import harxMascotte from '../LandingPage/assets/harx-mascotte.webp';
import companyBanner from '../assets/choice-company.jpg';
import repBanner from '../assets/choice-rep.jpg';
import { TAAS_COMPANY, TAAS_REPS } from '../../lib/taasPaths';

/** Accueil TAAS : le message en un écran, puis deux portes — espace COMPANY et espace REPS. */
export function TaasHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const container = titleContainerRef.current;
    const text = titleTextRef.current;
    if (!container || !text) return;
    const fitTitle = () => {
      let size = 72;
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
    document.fonts?.ready.then(fitTitle).catch(() => undefined);
    return () => observer.disconnect();
  }, []);

  const doors = [
    {
      id: 'company' as const,
      icon: Building2,
      image: companyBanner,
      tag: t('choicePage.companyTag', 'COMPANY'),
      title: t('taasHome.companyTitle', 'You need customer service professionals'),
      points: [t('taasHome.companyP1', 'You define the result and its price'), t('taasHome.companyP2', 'Professionals, human or AI, handle it'), t('taasHome.companyP3', 'You only pay for approved results')],
      cta: t('taasHome.companyCta', 'Enter the Company space'),
      path: TAAS_COMPANY,
    },
    {
      id: 'reps' as const,
      icon: Headphones,
      image: repBanner,
      tag: t('choicePage.repTag', 'REPS'),
      title: t('taasHome.repsTitle', 'You are a customer service professional'),
      points: [t('taasHome.repsP1', 'Choose your missions and your hours'), t('taasHome.repsP2', 'Work from anywhere in the world'), t('taasHome.repsP3', 'Get paid for every result')],
      cta: t('taasHome.repsCta', 'Enter the REPS space'),
      path: TAAS_REPS,
    },
  ];

  return (
    <>
      <div className="relative min-h-screen pt-24 bg-space-dark-default text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-harx-500/10 blur-[120px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-harx-alt-500/10 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }} />
        </div>

        <div className="container mx-auto px-4 pt-10 pb-10 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-slate-200 text-sm font-semibold mb-6 text-center">
              <Sparkles className="h-4 w-4 shrink-0 text-harx-400" aria-hidden="true" />
              {t('hero.badge', 'AI-Powered • 60,000+ Expert Agents • Transaction-as-a-Service')}
            </span>

            <div className="relative w-full max-w-[220px] md:max-w-[260px] mx-auto mb-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-harx-500/20 to-harx-alt-500/20 rounded-full blur-2xl" />
              <img src={harxMascotte} alt="HARX Mascotte" className="w-full h-auto object-contain relative z-10 animate-float drop-shadow-[0_15px_30px_rgba(255,77,77,0.15)]" loading="eager" />
            </div>

            <h1 className="font-extrabold tracking-tight mb-4 flex flex-col items-center gap-2 w-full">
              <div ref={titleContainerRef} className="w-full flex justify-center">
                <span ref={titleTextRef} className="bg-clip-text text-transparent bg-gradient-harx" style={{ whiteSpace: 'nowrap', lineHeight: 1.1 }}>
                  {t('hero.title1', 'AI-Powered Customer Engagement')}
                </span>
              </div>
              <span className="text-2xl sm:text-3xl md:text-4xl text-slate-400 font-semibold tracking-wider uppercase my-1">{t('hero.title2', 'Meets')}</span>
              <span className="text-3xl sm:text-4xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-harx-alt-400 to-harx-400">{t('hero.title3', 'Transaction-as-a-Service')}</span>
            </h1>

            <div className="text-lg md:text-xl text-slate-350 max-w-3xl mx-auto leading-relaxed space-y-4">
              <p>{t('hero.desc1', 'Stop paying for seats. Start paying for results.')}</p>
              <p>{t('hero.desc2', 'Uber connects you to drivers.')}</p>
              <p>{t('hero.desc3', 'Airbnb connects you to homes.')}</p>
              <p>{t('hero.desc4', 'Harx connects you to agents — and charges you only when they deliver.')}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="relative bg-space-dark-default px-4 pb-24 pt-4 text-white" aria-labelledby="taas-doors">
        <div className="mx-auto max-w-5xl text-center">
          <h2 id="taas-doors" className="text-2xl font-black md:text-3xl">{t('taasHome.doorsTitle', 'Which side are you on?')}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2" data-testid="taas-doors">
            {doors.map(({ id, icon: Icon, image, tag, title, points, cta, path }) => (
              <a
                key={id}
                href={path}
                data-testid={`taas-door-${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(path);
                }}
                className="group relative flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl border border-white/10 text-left shadow-2xl shadow-black/40 transition-transform duration-500 hover:-translate-y-1.5"
              >
                <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20" />
                <div className={`absolute inset-x-0 top-0 h-1 ${id === 'company' ? 'bg-gradient-to-r from-harx-500 to-amber-400' : 'bg-gradient-to-r from-harx-alt-500 to-violet-500'}`} />
                <div className="relative z-10 p-7">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-widest backdrop-blur">
                    <Icon className="h-4 w-4" aria-hidden="true" /> {tag}
                  </span>
                  <h3 className="mt-4 text-2xl font-black leading-tight">{title}</h3>
                  <ul className="mt-4 space-y-2 text-sm font-semibold text-slate-200">
                    {points.map((p) => (
                      <li key={p} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-harx-400" />{p}</li>
                    ))}
                  </ul>
                  <span className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-harx px-6 text-sm font-bold text-white shadow-lg shadow-harx-500/30 transition-all group-hover:shadow-harx-500/50">
                    {cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

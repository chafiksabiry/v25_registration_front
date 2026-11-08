import React, { useLayoutEffect, useRef } from 'react';
import { Button } from './Button';
import { ArrowDown, Sparkles } from 'lucide-react';
import harxMascotte from './assets/harx-mascotte.webp';

import { useTranslation } from 'react-i18next';

interface HeroProps {
  onGetStarted?: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  const { t } = useTranslation();
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const container = titleContainerRef.current;
    const text = titleTextRef.current;
    if (!container || !text) return;

    const fitTitle = () => {
      const maxPx = 72;
      const minPx = 12;
      let size = maxPx;
      text.style.fontSize = `${size}px`;

      const limit = container.clientWidth;
      while (text.scrollWidth > limit && size > minPx) {
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
    <div className="relative min-h-screen pt-24 bg-space-dark-default text-white">
      {/* Background glowing decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-harx-500/10 blur-[120px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-harx-alt-500/10 blur-[150px] rounded-full animate-pulse-slow" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-harx-500/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-16 pb-16 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6 animate-fade-in">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-slate-200 text-sm font-semibold mb-4 hover:border-harx-400/50 transition-all duration-300">
              <Sparkles className="h-4 w-4 shrink-0 text-harx-400" />
              {t('hero.badge', 'AI-Powered • 60,000+ Expert Agents • Transaction-as-a-Service')}
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

          <h1 className="font-extrabold tracking-tight mb-4 flex flex-col items-center gap-2 w-full">
            <div ref={titleContainerRef} className="w-full flex justify-center">
              <span
                ref={titleTextRef}
                className="bg-clip-text text-transparent bg-gradient-harx"
                style={{ whiteSpace: 'nowrap', lineHeight: 1.1 }}
              >
                {t('hero.title1', 'AI-Powered Customer Engagement')}
              </span>
            </div>
            <span className="text-2xl sm:text-3xl md:text-4xl text-slate-400 font-semibold tracking-wider uppercase my-1">
              {t('hero.title2', 'Meets')}
            </span>
            <span className="text-3xl sm:text-4xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-harx-alt-400 to-harx-400">
              {t('hero.title3', 'Transaction-as-a-Service')}
            </span>
          </h1>

          <div className="text-lg md:text-xl text-slate-350 mb-10 max-w-3xl mx-auto leading-relaxed space-y-6">
            <p>{t('hero.desc1', 'Stop paying for seats. Start paying for results.')}</p>
            <p>{t('hero.desc2', 'Uber connects you to drivers.')}</p>
            <p>{t('hero.desc3', 'Airbnb connects you to homes.')}</p>
            <p>{t('hero.desc4', 'Harx connects you to agents — and charges you only when they deliver.')}</p>
            <p>{t('hero.desc5', 'Harx connects your business to a global network of certified agents — human or AI — who handle your customer engagement end to end. Every interaction is scored in real time. You only pay when the result you defined is delivered.')}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Button
              size="lg"
              className="h-12 px-6 bg-gradient-harx hover:opacity-95 text-white font-semibold shadow-lg shadow-harx-500/20 hover:shadow-harx-500/35 transition-all duration-300"
              onClick={() => scrollToSection('how-it-works')}
              data-testid="hero-see-how"
            >
              {t('taasPage.seeHow', 'See how it works')}
              <ArrowDown className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 border border-white/10 hover:border-harx-500 bg-white/[0.03] hover:bg-white/[0.08] text-white transition-all duration-300"
              onClick={bookDemo}
            >
              {t('hero.bookDemo', 'Book a Demo')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

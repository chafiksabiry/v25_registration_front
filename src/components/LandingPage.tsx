import React, { Suspense, lazy } from 'react';
import { Header } from './LandingPage/Header';
import { Hero } from './LandingPage/Hero';
import { Footer } from './LandingPage/Footer';

// Lazy load non-critical components
const Features = lazy(() => import('./LandingPage/Features').then(module => ({ default: module.Features })));
const Testimonials = lazy(() => import('./LandingPage/Testimonials').then(module => ({ default: module.Testimonials })));
const HowItWorks = lazy(() => import('./LandingPage/HowItWorks').then(module => ({ default: module.HowItWorks })));
const About = lazy(() => import('./LandingPage/About').then(module => ({ default: module.About })));
const Pricing = lazy(() => import('./LandingPage/Pricing').then(module => ({ default: module.Pricing })));
const ForClients = lazy(() => import('./LandingPage/ForClients').then(module => ({ default: module.ForClients })));
const ForReps = lazy(() => import('./LandingPage/ForReps').then(module => ({ default: module.ForReps })));
const Contact = lazy(() => import('./LandingPage/Contact').then(module => ({ default: module.Contact })));
const LiveChat = lazy(() => import('./LandingPage/LiveChat').then(module => ({ default: module.LiveChat })));

interface LandingPageProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

export function LandingPage({ onSignIn, onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header onSignIn={onSignIn} onGetStarted={onGetStarted} />
      <main>
        <Hero onGetStarted={onGetStarted} />
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
          <section id="features" aria-label="Features">
            <Features onGetStarted={onGetStarted} />
          </section>
          <section id="testimonials" aria-label="Testimonials">
            <Testimonials />
          </section>
          <section id="how-it-works" aria-label="How It Works">
            <HowItWorks onGetStarted={onGetStarted} />
          </section>
          <section id="pricing" aria-label="Pricing">
            <Pricing onGetStarted={onGetStarted} />
          </section>
          <section id="about" aria-label="About Us">
            <About onGetStarted={onGetStarted} />
          </section>
          <section id="clients" aria-label="For Clients">
            <ForClients onGetStarted={onGetStarted} />
          </section>
          <section id="reps" aria-label="For Representatives">
            <ForReps onGetStarted={onGetStarted} />
          </section>
          <section id="contact-form" aria-label="Contact Us">
            <Contact />
          </section>
        </Suspense>
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
}

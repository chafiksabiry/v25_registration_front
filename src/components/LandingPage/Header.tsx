import React from 'react';
import { Button } from './Button';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  onSignIn: () => void;
  onGetStarted: () => void;
}

export function Header({ onSignIn, onGetStarted }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto rounded-2xl bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl border border-slate-200/40 dark:border-slate-800/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-300">
      <nav className="px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-10">
          <a
            href="/"
            className="flex items-center transition-transform hover:scale-102"
            onClick={(e) => handleNavClick(e, 'top')}
          >
            <Logo className="h-8 md:h-9" />
          </a>

          <div className="hidden md:flex items-center space-x-2">
            <a
              href="/#how-it-works"
              className="relative font-medium text-sm px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-xl hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all duration-200"
              onClick={(e) => handleNavClick(e, 'how-it-works')}
            >
              How It Works
            </a>
            <a
              href="/#pricing"
              className="relative font-medium text-sm px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-xl hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all duration-200"
              onClick={(e) => handleNavClick(e, 'pricing')}
            >
              Pricing
            </a>
            <a
              href="/#about"
              className="relative font-medium text-sm px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-xl hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all duration-200"
              onClick={(e) => handleNavClick(e, 'about')}
            >
              About
            </a>
            <a
              href="/#clients"
              className="relative font-medium text-sm px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-xl hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all duration-200"
              onClick={(e) => handleNavClick(e, 'clients')}
            >
              For Clients
            </a>
            <a
              href="/#reps"
              className="relative font-medium text-sm px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-xl hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all duration-200"
              onClick={(e) => handleNavClick(e, 'reps')}
            >
              For Reps
            </a>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-3">
          <Button
            variant="outline"
            className="h-9 px-4 text-sm font-semibold border border-slate-200 hover:border-harx-300 hover:text-harx-600 dark:border-slate-800 dark:hover:border-harx-700 bg-white/60 dark:bg-slate-900/60 transition-all"
            onClick={onSignIn}
          >
            Sign In
          </Button>
          <Button
            variant="gradient"
            className="h-9 px-4 text-sm font-semibold shadow-md shadow-harx-500/10 hover:shadow-harx-500/25 active:scale-[0.98] transition-all"
            onClick={onGetStarted}
          >
            Get Started
          </Button>
        </div>

        <button
          className="md:hidden text-harx-500 p-2 hover:bg-harx-50 dark:hover:bg-slate-900 rounded-xl transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[calc(100%+8px)] left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-xl animate-fade-in">
          <div className="flex flex-col space-y-4">
            <a
              href="#how-it-works"
              className="text-base font-semibold text-gray-700 hover:text-harx-500 dark:text-gray-300 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={(e) => handleNavClick(e, 'how-it-works')}
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-base font-semibold text-gray-700 hover:text-harx-500 dark:text-gray-300 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={(e) => handleNavClick(e, 'pricing')}
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-base font-semibold text-gray-700 hover:text-harx-500 dark:text-gray-300 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={(e) => handleNavClick(e, 'about')}
            >
              About
            </a>
            <a
              href="#clients"
              className="text-base font-semibold text-gray-700 hover:text-harx-500 dark:text-gray-300 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={(e) => handleNavClick(e, 'clients')}
            >
              For Clients
            </a>
            <a
              href="#reps"
              className="text-base font-semibold text-gray-700 hover:text-harx-500 dark:text-gray-300 transition-colors py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
              onClick={(e) => handleNavClick(e, 'reps')}
            >
              For Reps
            </a>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <Button variant="outline" className="w-full h-10 text-sm font-semibold" onClick={onSignIn}>Sign In</Button>
              <Button variant="gradient" className="w-full h-10 text-sm font-semibold" onClick={onGetStarted}>Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

import React from 'react';
import { Menu, X } from 'lucide-react';
import harxLogo from './assets/logo-harx.png';

/** HARX navbar gradient — vivid red (left) transitioning to magenta/pink (right). */
const HARX_NAV_GRADIENT = 'linear-gradient(90deg, #E51A4C 0%, #E01070 55%, #E6188D 100%)';

interface HeaderProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  /**
   * Called when the user clicks a navbar entry whose target section
   * does NOT exist in the current DOM (e.g. user is on the ChoicePage
   * or a dialog). The parent is then expected to switch back to the
   * landing page and scroll to that section.
   */
  onNavigateToSection?: (sectionId: string) => void;
}

export function Header({ onSignIn, onGetStarted, onNavigateToSection }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (onNavigateToSection) {
      e.preventDefault();
      onNavigateToSection(sectionId);
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'clients', label: 'For Clients' },
    { id: 'reps', label: 'For Reps' },
  ];

  return (
    <header
      style={{ backgroundImage: HARX_NAV_GRADIENT }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 shadow-[0_1px_0_0_rgba(0,0,0,0.08)]"
    >
      <nav className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-10">
          <a
            href="/"
            className="flex items-center transition-transform hover:scale-[1.02]"
            onClick={(e) => handleNavClick(e, 'top')}
          >
            <img src={harxLogo} alt="HARX" className="h-9 w-auto object-contain" />
          </a>

          <div className="hidden md:flex items-center">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`/#${link.id}`}
                className="relative font-semibold text-sm px-4 py-2 text-white/85 hover:text-white hover:bg-white/10 transition-all duration-200"
                onClick={(e) => handleNavClick(e, link.id)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-3">
          <button
            className="h-9 px-5 text-sm font-bold text-white border border-white/40 hover:bg-white/10 transition-all"
            onClick={onSignIn}
          >
            Sign In
          </button>
          <button
            className="h-9 px-5 text-sm font-bold bg-white text-[#C2186F] hover:bg-white/90 active:scale-[0.98] transition-all shadow-sm"
            onClick={onGetStarted}
          >
            Get Started
          </button>
        </div>

        <button
          className="md:hidden text-white p-2 hover:bg-white/10 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          style={{ backgroundImage: HARX_NAV_GRADIENT }}
          className="md:hidden absolute top-full left-0 right-0 border-t border-white/15 p-6 shadow-xl animate-fade-in"
        >
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="text-base font-semibold text-white/90 hover:text-white transition-colors py-2.5 px-3 hover:bg-white/10"
                onClick={(e) => handleNavClick(e, link.id)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 mt-2 border-t border-white/15 space-y-3">
              <button className="w-full h-10 text-sm font-bold text-white border border-white/40 hover:bg-white/10 transition-all" onClick={onSignIn}>Sign In</button>
              <button className="w-full h-10 text-sm font-bold bg-white text-[#C2186F] hover:bg-white/90 transition-all" onClick={onGetStarted}>Get Started</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

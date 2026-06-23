import React from 'react';
import { ArrowRight, Building2, Headphones, Menu, X } from 'lucide-react';
import { Logo } from './Logo';

/** HARX navbar gradient — vivid red (left) transitioning to magenta/pink (right). */
const HARX_NAV_GRADIENT = 'linear-gradient(90deg, #E51A4C 0%, #E01070 55%, #E6188D 100%)';

type NavLink = {
  id: string;
  label: string;
  variant?: 'default' | 'company' | 'rep';
};

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

  const navLinks: NavLink[] = [
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'clients', label: 'For Companies', variant: 'company' },
    { id: 'reps', label: 'For Reps', variant: 'rep' },
  ];

  const linkClass = (variant: NavLink['variant']) => {
    if (variant === 'company') {
      return 'nav-audience-pill nav-audience-pill--company';
    }
    if (variant === 'rep') {
      return 'nav-audience-pill nav-audience-pill--rep';
    }
    return 'nav-link-default';
  };

  const renderLinkIcon = (variant: NavLink['variant']) => {
    if (variant === 'company') {
      return <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
    }
    if (variant === 'rep') {
      return <Headphones className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />;
    }
    return null;
  };

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
            <Logo className="h-14 w-auto md:h-16" />
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`/#${link.id}`}
                className={linkClass(link.variant)}
                onClick={(e) => handleNavClick(e, link.id)}
              >
                {renderLinkIcon(link.variant)}
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <button type="button" className="nav-cta nav-cta--signin" onClick={onSignIn}>
            Sign In
          </button>
          <button type="button" className="nav-cta nav-cta--started group" onClick={onGetStarted}>
            Get Started
            <ArrowRight className="nav-cta-arrow h-4 w-4" aria-hidden="true" />
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
                className={
                  link.variant
                    ? `${linkClass(link.variant)} my-1 w-full justify-center`
                    : 'px-3 py-2.5 text-base font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white'
                }
                onClick={(e) => handleNavClick(e, link.id)}
              >
                {renderLinkIcon(link.variant)}
                <span>{link.label}</span>
              </a>
            ))}
            <div className="pt-4 mt-2 border-t border-white/15 space-y-3">
              <button type="button" className="nav-cta nav-cta--signin nav-cta--full" onClick={onSignIn}>
                Sign In
              </button>
              <button type="button" className="nav-cta nav-cta--started nav-cta--full group" onClick={onGetStarted}>
                Get Started
                <ArrowRight className="nav-cta-arrow h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

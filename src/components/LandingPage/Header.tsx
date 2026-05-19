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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-harx-100 shadow-sm transition-all duration-300">
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <a
            href="/"
            className="flex items-center transition-transform hover:scale-105"
            onClick={(e) => handleNavClick(e, 'top')}
          >
            <Logo className="h-10 md:h-12" />
          </a>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/#how-it-works"
              className="relative font-medium text-lg group"
              onClick={(e) => handleNavClick(e, 'how-it-works')}
            >
              <span className="bg-gradient-harx bg-clip-text text-transparent group-hover:text-harx-500 transition-colors">
                How It Works
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-harx transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </a>
            <a
              href="/#pricing"
              className="relative font-medium text-lg group"
              onClick={(e) => handleNavClick(e, 'pricing')}
            >
              <span className="bg-gradient-harx bg-clip-text text-transparent group-hover:text-harx-500 transition-colors">
                Pricing
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-harx transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </a>
            <a
              href="/#about"
              className="relative font-medium text-lg group"
              onClick={(e) => handleNavClick(e, 'about')}
            >
              <span className="bg-gradient-harx bg-clip-text text-transparent group-hover:text-harx-500 transition-colors">
                About
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-harx transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </a>
            <a
              href="/#clients"
              className="relative font-medium text-lg group"
              onClick={(e) => handleNavClick(e, 'clients')}
            >
              <span className="bg-gradient-harx bg-clip-text text-transparent group-hover:text-harx-500 transition-colors">
                For Clients
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-harx transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </a>
            <a
              href="/#reps"
              className="relative font-medium text-lg group"
              onClick={(e) => handleNavClick(e, 'reps')}
            >
              <span className="bg-gradient-harx bg-clip-text text-transparent group-hover:text-harx-500 transition-colors">
                For Reps
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-harx transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </a>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" onClick={onSignIn}>Sign In</Button>
          <Button onClick={onGetStarted}>Get Started</Button>
        </div>

        <button
          className="md:hidden text-harx-500 p-2 hover:bg-harx-50 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-harx-100 p-6 shadow-lg animate-in slide-in-from-top-4">
          <div className="flex flex-col space-y-6">
            <a
              href="#how-it-works"
              className="text-lg font-medium bg-gradient-harx bg-clip-text text-transparent hover:text-harx-500 transition-colors"
              onClick={(e) => handleNavClick(e, 'how-it-works')}
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-lg font-medium bg-gradient-harx bg-clip-text text-transparent hover:text-harx-500 transition-colors"
              onClick={(e) => handleNavClick(e, 'pricing')}
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-lg font-medium bg-gradient-harx bg-clip-text text-transparent hover:text-harx-500 transition-colors"
              onClick={(e) => handleNavClick(e, 'about')}
            >
              About
            </a>
            <a
              href="#clients"
              className="text-lg font-medium bg-gradient-harx bg-clip-text text-transparent hover:text-harx-500 transition-colors"
              onClick={(e) => handleNavClick(e, 'clients')}
            >
              For Clients
            </a>
            <a
              href="#reps"
              className="text-lg font-medium bg-gradient-harx bg-clip-text text-transparent hover:text-harx-500 transition-colors"
              onClick={(e) => handleNavClick(e, 'reps')}
            >
              For Reps
            </a>
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <Button variant="outline" className="w-full" onClick={onSignIn}>Sign In</Button>
              <Button className="w-full" onClick={onGetStarted}>Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

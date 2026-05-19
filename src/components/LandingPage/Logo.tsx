import React from 'react';
import harxLogo from './assets/logo_harx.png';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'white';
}

export function Logo({ className = "h-10 w-10 md:h-12 md:w-12", variant = 'default' }: LogoProps) {
  return (
    <div className={`${className} relative flex items-center justify-center shrink-0`}>
      <div className="relative h-full w-full flex items-center justify-center rounded-xl overflow-hidden shadow-sm border border-harx-100/50 bg-white">
        <img
          src={harxLogo}
          alt="HARX Logo"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {variant === 'white' && (
          <div className="absolute inset-0 mix-blend-luminosity brightness-200 contrast-100" />
        )}
      </div>
    </div>
  );
}

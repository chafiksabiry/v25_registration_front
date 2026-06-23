import React from 'react';
import harxLogo from './assets/logo-harx.png';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-10 w-auto' }: LogoProps) {
  return (
    <img
      src={harxLogo}
      alt="HARX"
      className={`object-contain ${className}`}
    />
  );
}

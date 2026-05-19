import React from 'react';
import { cn } from './cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  href?: string;
  external?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  href,
  external,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (href) {
      e.preventDefault();
      if (external) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = href;
      }
    }
    onClick?.(e);
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-harx-500 text-white hover:bg-harx-600 active:bg-harx-700 focus-visible:ring-harx-500 shadow-sm hover:shadow-md': variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-500': variant === 'secondary',
          'border-2 border-harx-500 bg-transparent text-harx-500 hover:bg-harx-50 active:bg-harx-100 focus-visible:ring-harx-500': variant === 'outline',
          'bg-gradient-harx hover:opacity-90 active:opacity-100 text-white shadow-md hover:shadow-lg active:shadow-sm focus-visible:ring-harx-500': variant === 'gradient',
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
          'h-14 px-8 text-xl': size === 'xl',
          'w-full': fullWidth,
        },
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

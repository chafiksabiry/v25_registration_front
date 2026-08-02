/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'harx': {
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffc2c2',
          300: '#ff9494',
          400: '#ff6b6b',
          500: '#ff4d4d',
          600: '#ff3333',
          700: '#ff1a1a',
          800: '#ff0000',
          900: '#cc0000',
          950: '#990000',
        },
        'harx-alt': {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        'space-dark': {
          900: '#030712',
          950: '#020617',
          default: '#090d16',
        },
        slate: {
          350: '#b6c0cf',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-harx': 'linear-gradient(to right, #ff4d4d, #ec4899)',
        'gradient-dark-mesh': 'radial-gradient(circle at 10% 20%, rgba(255, 77, 77, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(236, 72, 153, 0.08) 0%, transparent 40%), bg-space-dark',
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'pulse-slow': 'pulse-slow 8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s infinite alternate',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.1)', opacity: '0.7' },
        },
        'glow-pulse': {
          '0%': { 'box-shadow': '0 0 10px rgba(255, 77, 77, 0.2), 0 0 20px rgba(255, 77, 77, 0.1)' },
          '100%': { 'box-shadow': '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)' },
        },
      },
    },
  },
  plugins: [],
};

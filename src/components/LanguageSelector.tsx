import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FrenchFlag = () => (
  <svg width="20" height="14" viewBox="0 0 3 2" className="rounded-sm overflow-hidden shrink-0">
    <rect width="3" height="2" fill="#ED2939" />
    <rect width="2" height="2" fill="#fff" />
    <rect width="1" height="2" fill="#002395" />
  </svg>
);

const EnglishFlag = () => (
  <svg width="20" height="14" viewBox="0 0 60 30" className="rounded-sm overflow-hidden shrink-0">
    <clipPath id="s">
      <path d="M0,0 v30 h60 v-30 z" />
    </clipPath>
    <clipPath id="t">
      <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
    </clipPath>
    <g clipPath="url(#s)">
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isFrench = i18n.language.startsWith('fr');

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectLanguage = (lang: 'fr' | 'en') => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 bg-[#1A1D24] hover:bg-[#252932] border border-white/10 transition-colors rounded-full px-3 py-1.5"
      >
        {isFrench ? <FrenchFlag /> : <EnglishFlag />}
        <span className="text-gray-200 font-semibold text-sm">
          {isFrench ? 'Français' : 'English'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-[#1A1D24] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="py-1">
            <button
              onClick={() => selectLanguage('fr')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                isFrench ? 'text-white bg-white/5' : 'text-gray-300'
              }`}
            >
              <FrenchFlag />
              <span className="font-medium">Français</span>
            </button>
            <button
              onClick={() => selectLanguage('en')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                !isFrench ? 'text-white bg-white/5' : 'text-gray-300'
              }`}
            >
              <EnglishFlag />
              <span className="font-medium">English</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

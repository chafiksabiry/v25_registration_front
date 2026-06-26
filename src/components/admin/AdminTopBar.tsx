import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, LogOut, Menu, Shield, UserCircle } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HARX_BAR_SHADOW, HARX_NAVBAR_BG, HARX_TEXT_SHADOW } from '../../lib/harxBrand';
import { ADMIN_SECTIONS } from './adminSections';

type AdminTopBarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function AdminTopBar({ isSidebarOpen, setIsSidebarOpen, onLogout }: AdminTopBarProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [displayName, setDisplayName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    setDisplayName(localStorage.getItem('userFullName') || 'Admin');
    setAdminEmail(localStorage.getItem('userEmail') || '');
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  const initials = getInitials(displayName);

  return (
    <header
      style={{ backgroundImage: HARX_NAVBAR_BG, boxShadow: HARX_BAR_SHADOW, textShadow: HARX_TEXT_SHADOW }}
      className="relative h-16 grid grid-cols-[auto_1fr_auto] items-center gap-2 px-4 sm:px-8 shrink-0 z-20"
    >
      <div className="flex items-center">
        <button
          type="button"
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300 shadow-sm lg:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <nav className="hidden sm:flex items-center justify-center gap-2 min-w-0 overflow-x-auto">
        {ADMIN_SECTIONS.map(({ to, label, shortLabel, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center gap-2.5 px-2.5 md:px-4 py-2.5 rounded-2xl border transition-all duration-200 shadow-lg shadow-black/10 active:scale-95 shrink-0',
                isActive
                  ? 'bg-white text-[#E6188D] border-white'
                  : 'bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:border-white/40',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={[
                    'p-1.5 rounded-xl transition-all duration-200 shadow-sm',
                    isActive
                      ? 'bg-[#E6188D]/10 text-[#E6188D]'
                      : 'bg-white/20 text-white group-hover:bg-white group-hover:text-[#E6188D]',
                  ].join(' ')}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left leading-none">
                  <span className="text-[9px] font-black uppercase tracking-wider hidden xl:block opacity-70">
                    Admin
                  </span>
                  <span className="text-sm font-black tracking-wide mt-0.5 block">
                    <span className="hidden md:inline">{label}</span>
                    <span className="md:hidden">{shortLabel}</span>
                  </span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-end gap-2 sm:gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            onClick={() => setIsDropdownOpen((open) => !open)}
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black shadow-sm border border-white/20">
              {initials}
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm font-black tracking-tight text-white">{displayName}</p>
              <p className="text-[10px] text-white/70 font-medium">Administrateur</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-white/50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <div
              style={{ backgroundImage: HARX_NAVBAR_BG }}
              className="absolute right-0 mt-2 w-64 border border-white/20 rounded-2xl shadow-2xl shadow-[#8A1250]/40 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="relative px-4 py-4 flex items-center gap-3 border-b border-white/20 bg-white/10 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-lg shadow-md shrink-0 ring-1 ring-white/30">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-white truncate">{displayName}</p>
                  <p className="text-[10px] text-white/70 font-medium truncate mt-0.5">{adminEmail || 'Admin HARX'}</p>
                </div>
              </div>

              <div className="py-2 px-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/15 transition-colors group"
                >
                  <div className="p-1.5 bg-white/20 text-white rounded-lg group-hover:bg-white group-hover:text-[#E6188D] transition-all duration-200">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span>Back office</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/15 transition-colors group"
                >
                  <div className="p-1.5 bg-white/20 text-white rounded-lg group-hover:bg-white group-hover:text-[#E6188D] transition-all duration-200">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <span>Site public</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/admin/users');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/15 transition-colors group"
                >
                  <div className="p-1.5 bg-white/20 text-white rounded-lg group-hover:bg-white group-hover:text-[#E6188D] transition-all duration-200">
                    <UserCircle className="h-4 w-4" />
                  </div>
                  <span>Utilisateurs</span>
                </button>
              </div>

              <div className="border-t border-white/20 px-3 py-3">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-white hover:bg-black/20 rounded-xl transition-colors group"
                >
                  <div className="p-1.5 bg-white/20 text-white rounded-lg group-hover:bg-white group-hover:text-[#ED1C24] transition-all duration-200">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

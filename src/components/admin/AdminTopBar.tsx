import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, LogOut, Menu, Shield, UserCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_GRADIENT, ADMIN_THEME } from '../../lib/adminTheme';
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

function pageTitle(pathname: string) {
  if (pathname.startsWith('/admin/users/') && pathname !== '/admin/users') return 'Fiche utilisateur';
  const match = ADMIN_SECTIONS.find(({ to, end }) =>
    end ? pathname === to : pathname.startsWith(to),
  );
  return match?.label || 'Administration';
}

export default function AdminTopBar({ isSidebarOpen, setIsSidebarOpen, onLogout }: AdminTopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
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
  const title = pageTitle(location.pathname);

  return (
    <header
      className="relative h-16 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 shrink-0 z-20 bg-white border-b"
      style={{ borderColor: ADMIN_THEME.border, boxShadow: ADMIN_THEME.shadow }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="p-2.5 rounded-xl border text-slate-600 hover:bg-slate-50 transition-colors lg:hidden"
          style={{ borderColor: ADMIN_THEME.border }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden sm:block">
            Administration HARX
          </p>
          <h1 className="text-lg font-bold text-slate-900 truncate">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border hover:bg-slate-50 transition-colors"
            style={{ borderColor: ADMIN_THEME.border }}
            onClick={() => setIsDropdownOpen((open) => !open)}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundImage: ADMIN_GRADIENT }}
            >
              {initials}
            </div>
            <div className="hidden md:block text-left min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate max-w-[140px]">{displayName}</p>
              <p className="text-[11px] text-slate-500">Admin</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform hidden sm:block ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white border rounded-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ borderColor: ADMIN_THEME.border, boxShadow: ADMIN_THEME.shadowLg }}
            >
              <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-100 bg-slate-50/80">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundImage: ADMIN_GRADIENT }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{adminEmail || 'Admin HARX'}</p>
                </div>
              </div>

              <div className="py-1.5 px-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/admin');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Shield className="h-4 w-4 text-[#E6188D]" />
                  Tableau de bord
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/admin/users');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <UserCircle className="h-4 w-4 text-[#E6188D]" />
                  Utilisateurs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                  Site public
                </button>
              </div>

              <div className="border-t border-slate-100 px-1.5 py-1.5">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

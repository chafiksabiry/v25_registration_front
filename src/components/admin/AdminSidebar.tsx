import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import logoHarx from '../../assets/logo-harx.png';
import { HARX_SIDEBAR_BG, HARX_BAR_SHADOW } from '../../lib/harxBrand';
import { ADMIN_SECTIONS } from './adminSections';

type AdminSidebarProps = {
  adminName: string;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
};

export default function AdminSidebar({
  adminName,
  isSidebarOpen,
  setIsSidebarOpen,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside
      style={{ backgroundImage: HARX_SIDEBAR_BG, boxShadow: HARX_BAR_SHADOW }}
      className={[
        'fixed inset-y-0 left-0 z-30 w-64 text-white flex flex-col shrink-0 transition-transform duration-300 lg:static lg:translate-x-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
    >
      <div className="p-5 border-b border-white/15 flex items-center justify-between gap-3">
        <Link to="/admin" className="flex items-center min-w-0" onClick={() => setIsSidebarOpen(false)}>
          <img src={logoHarx} alt="HARX" className="h-10 w-auto shrink-0" />
        </Link>
        <button
          type="button"
          className="lg:hidden p-2 rounded-lg hover:bg-white/10"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Fermer le menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
        {ADMIN_SECTIONS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                isActive ? 'bg-white/20 text-white shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/15">
        <p className="text-xs text-white/50 mb-2 truncate">{adminName}</p>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

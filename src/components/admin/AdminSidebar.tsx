import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LogOut, Shield, X } from 'lucide-react';
import logoHarx from '../../assets/logo-harx.png';
import { ADMIN_GRADIENT, ADMIN_THEME } from '../../lib/adminTheme';
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
      style={{ backgroundColor: ADMIN_THEME.sidebar }}
      className={[
        'fixed inset-y-0 left-0 z-30 w-[17.5rem] text-white flex flex-col shrink-0 transition-transform duration-300 lg:static lg:translate-x-0 border-r',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
    >
      <div
        className="p-5 flex items-center justify-between gap-3"
        style={{ borderBottom: `1px solid ${ADMIN_THEME.sidebarBorder}` }}
      >
        <Link to="/admin" className="flex items-center gap-3 min-w-0" onClick={() => setIsSidebarOpen(false)}>
          <img src={logoHarx} alt="HARX" className="h-9 w-auto shrink-0 brightness-0 invert" />
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">HARX Admin</p>
            <p className="text-[10px] text-white/50 uppercase tracking-widest">Back office</p>
          </div>
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

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {ADMIN_SECTIONS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-white/65 hover:bg-white/5 hover:text-white',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'text-white' : 'bg-white/5 text-white/70 group-hover:bg-white/10',
                  ].join(' ')}
                  style={isActive ? { backgroundImage: ADMIN_GRADIENT } : undefined}
                >
                  <Icon size={18} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 space-y-3" style={{ borderTop: `1px solid ${ADMIN_THEME.sidebarBorder}` }}>
        <div className="flex items-center gap-3 px-2">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundImage: ADMIN_GRADIENT }}
          >
            <Shield size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{adminName}</p>
            <p className="text-[11px] text-white/45">Administrateur</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

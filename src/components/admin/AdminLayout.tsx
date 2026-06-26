import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Shield, Users } from 'lucide-react';
import Cookies from 'js-cookie';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    setAdminName(localStorage.getItem('userFullName') || 'Admin');
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userEmail');
    Cookies.remove('userId', { path: '/' });
    setToken(null);
    navigate('/admin/signin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F5F0F5] flex">
      <aside className="w-64 bg-[#1A0A1E] text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#E91E8C]">
            <Shield size={22} />
            <span className="font-black tracking-wide">HARX Admin</span>
          </div>
          <p className="text-xs text-white/50 mt-2">Back office</p>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
          >
            <LayoutDashboard size={18} />
            Tableau de bord
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Users size={18} />
            Utilisateurs
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-2 truncate">{adminName}</p>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

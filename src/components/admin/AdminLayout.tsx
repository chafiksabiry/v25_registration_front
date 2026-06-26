import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useAuth } from '../../contexts/AuthContext';
import { HARX_NAVBAR_BG } from '../../lib/harxBrand';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [adminName, setAdminName] = useState('Admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="flex h-screen bg-[#E6188D] overflow-hidden">
      <AdminSidebar
        adminName={adminName}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onLogout={logout}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity duration-300 cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className="flex flex-1 flex-col overflow-hidden min-w-0"
        style={{ backgroundImage: HARX_NAVBAR_BG }}
      >
        <AdminTopBar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onLogout={logout}
        />
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../contexts/AuthContext';
import { isSessionActive } from '../../lib/authRedirect';

type TokenPayload = {
  userId?: string;
  typeUser?: string | null;
  exp?: number;
};

function decodeToken(token?: string | null): TokenPayload | null {
  if (!token) return null;
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}

export function isAdminSession(token?: string | null): boolean {
  if (!isSessionActive(token)) return false;
  const decoded = decodeToken(token ?? localStorage.getItem('token'));
  return decoded?.typeUser === 'admin';
}

export function AdminSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A0A1E]">
      <div className="animate-spin h-8 w-8 border-4 border-[#E91E8C] border-t-transparent rounded-full" />
    </div>
  );
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { loading, token } = useAuth();
  const location = useLocation();

  if (loading) return <AdminSpinner />;

  if (!isAdminSession(token)) {
    return <Navigate to="/admin/signin" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export function AdminGuestOnly({ children }: { children: React.ReactNode }) {
  const { loading, token } = useAuth();

  if (loading) return <AdminSpinner />;
  if (isAdminSession(token)) return <Navigate to="/admin" replace />;

  return <>{children}</>;
}

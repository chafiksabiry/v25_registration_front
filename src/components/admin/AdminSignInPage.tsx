import React, { useState } from 'react';
import { Lock, Mail, Shield } from 'lucide-react';
import Cookies from 'js-cookie';
import { adminApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { syncSessionUserIdCookie } from '../../lib/authRedirect';
import { hardNavigate } from '../../lib/appNavigation';

export default function AdminSignInPage() {
  const { setToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await adminApi.login({ email, password });
      const token = result.data.token;
      const user = result.data.user;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.userId);
      localStorage.setItem('userFullName', user.fullName);
      localStorage.setItem('userEmail', user.email);
      syncSessionUserIdCookie(token);
      Cookies.set('userId', user.userId, { path: '/', sameSite: 'Lax' });
      setToken(token);
      hardNavigate('/admin');
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || 'Identifiants admin invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A0A1E] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#F7631B] to-[#E91E8C] flex items-center justify-center text-white">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">HARX Admin</h1>
            <p className="text-sm text-slate-500">Connexion back office</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email admin</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#E91E8C]"
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F7631B] to-[#E91E8C] text-white font-bold disabled:opacity-60"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

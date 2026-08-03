import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { clearAuthSession } from '../lib/authRedirect';
import {
  broadcastAuthChanged,
  readStoredAuthToken,
  subscribeAuthChanged,
} from '../lib/authSync';

interface User {
  userId: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  setToken: () => {},
});

function decodeUser(token: string | null): User | null {
  if (!token) return null;
  try {
    const decoded = jwtDecode<User>(token);
    if (decoded.exp * 1000 < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => readStoredAuthToken());
  const [user, setUser] = useState<User | null>(() => decodeUser(readStoredAuthToken()));
  const [loading, setLoading] = useState(true);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      clearAuthSession();
    }
    setTokenState(newToken);
    broadcastAuthChanged({
      token: newToken,
      userId: newToken ? decodeUser(newToken)?.userId ?? null : null,
      source: 'registration',
    });
  };

  useEffect(() => {
    const decoded = decodeUser(token);
    if (token && !decoded) {
      clearAuthSession();
      setTokenState(null);
      setUser(null);
      broadcastAuthChanged({ token: null, userId: null, source: 'registration' });
    } else {
      setUser(decoded);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    return subscribeAuthChanged((detail) => {
      const next =
        detail.source === 'registration' || detail.source === 'event'
          ? detail.token
          : readStoredAuthToken();
      setTokenState((prev) => (prev === next ? prev : next));
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

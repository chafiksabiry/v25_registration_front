import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

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
  setToken: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setTokenState(newToken);
  };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<User>(token);
        if (decoded.exp * 1000 < Date.now()) {
          setToken(null);
          setUser(null);
        } else {
          setUser(decoded);
        }
      } catch (error) {
        setToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, loading, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
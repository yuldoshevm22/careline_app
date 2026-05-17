'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useTelegram } from './TelegramProvider';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  login: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  login: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { webApp, isReady } = useTelegram();
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async () => {
    try {
      const initData = webApp?.initData;

      // Dev mode fallback
      const body = initData
        ? { initData }
        : {
            devMode: true,
            user: {
              id: 123456789,
              first_name: 'Dev',
              last_name: 'User',
              username: 'devuser',
            },
          };

      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUserId(data.userId);
        localStorage.setItem('careline_token', data.token);
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady) return;

    // Try stored token first
    const stored = localStorage.getItem('careline_token');
    if (stored) {
      setToken(stored);
      setIsLoading(false);
      return;
    }

    login();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isLoading,
        userId,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

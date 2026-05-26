'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface SessionExpiredContextValue {
  isExpired: boolean;
  triggerExpired: () => void;
  clearExpired: () => void;
}

const SessionExpiredContext = createContext<SessionExpiredContextValue>({
  isExpired: false,
  triggerExpired: () => {},
  clearExpired: () => {},
});

function readExpiresAt(): Date | null {
  const match = document.cookie.split('; ').find((r) => r.startsWith('auth_expires_at='));
  if (!match) return null;
  const d = new Date(decodeURIComponent(match.split('=')[1]));
  return isNaN(d.getTime()) ? null : d;
}

export function SessionExpiredProvider({ children }: { children: React.ReactNode }) {
  const [isExpired, setIsExpired] = useState(false);

  const triggerExpired = useCallback(() => setIsExpired(true), []);
  const clearExpired = useCallback(() => setIsExpired(false), []);

  useEffect(() => {
    if (isExpired) return;

    const expiresAt = readExpiresAt();
    if (!expiresAt) return;

    const ms = expiresAt.getTime() - Date.now();
    const timer = setTimeout(() => setIsExpired(true), Math.max(ms, 0));
    return () => clearTimeout(timer);
  }, [isExpired]);

  return (
    <SessionExpiredContext.Provider value={{ isExpired, triggerExpired, clearExpired }}>
      {children}
    </SessionExpiredContext.Provider>
  );
}

export const useSessionExpired = () => useContext(SessionExpiredContext);

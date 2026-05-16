'use client';
import { createContext, useContext, useState } from 'react';

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

export function SessionExpiredProvider({ children }: { children: React.ReactNode }) {
  const [isExpired, setIsExpired] = useState(false);

  return (
    <SessionExpiredContext.Provider
      value={{
        isExpired,
        triggerExpired: () => setIsExpired(true),
        clearExpired: () => setIsExpired(false),
      }}
    >
      {children}
    </SessionExpiredContext.Provider>
  );
}

export const useSessionExpired = () => useContext(SessionExpiredContext);

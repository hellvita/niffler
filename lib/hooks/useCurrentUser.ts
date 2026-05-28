'use client';
import { useState, useEffect } from 'react';

export function useCurrentUser() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    const match = document.cookie.split('; ').find((r) => r.startsWith('user_email='));
    setEmail(match ? decodeURIComponent(match.split('=')[1]) : null);
  }, []);
  return { email };
}

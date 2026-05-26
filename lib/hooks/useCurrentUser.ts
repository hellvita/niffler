export function useCurrentUser() {
  if (typeof document === 'undefined') return { email: null };
  const match = document.cookie.split('; ').find((r) => r.startsWith('user_email='));
  const email = match ? decodeURIComponent(match.split('=')[1]) : null;
  return { email };
}

import { useAuthStore } from '../../features/auth/stores/authStore';

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return { token, user, isAuthenticated, clearAuth };
}

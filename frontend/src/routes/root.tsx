import { Outlet, useMatches, useNavigate } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { useAuthStore } from '../features/auth/stores/authStore';
import type { RootHandle } from '../router';

export default function RootLayout() {
  const matches = useMatches();
  const rootMatch = matches[0];
  const handle = rootMatch?.handle as RootHandle | undefined;

  const primaryNavLinks = handle?.primaryNav ?? [];
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    void navigate('/login');
  }

  return (
    <div className="app-shell">
      <Header links={primaryNavLinks} onLogout={handleLogout} />
      <Breadcrumbs className="mt-2" />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

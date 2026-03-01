import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router';
import { login } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';
import axios from 'axios';

export function LoginPageView() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const token = await login({ email, password });
      // Store token — user info can be fetched later via /auth/me endpoint
      setAuth(token.access_token, {
        id: '',
        email,
        name: email,
        created_at: new Date().toISOString(),
      });
      await navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
        setError(detail ?? 'Login failed. Please check your credentials.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="card card-padding space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-text-muted">
              Welcome back to DailyTracker
            </p>
          </div>

          {error !== null && (
            <div className="rounded-md border border-danger-soft bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="input-root">
              <label htmlFor="email" className="input-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-root">
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full disabled:opacity-60"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-accent-muted hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

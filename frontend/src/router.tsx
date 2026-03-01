import { createBrowserRouter, type RouteObject } from 'react-router';
import { LoginPageView } from './features/auth/ui/LoginPageView';
import { RegisterPageView } from './features/auth/ui/RegisterPageView';
import { ProtectedRoute } from './routes/ProtectedRoute';
import ErrorPage from './routes/error-page';
import RootLayout from './routes/root';

export type NavLink = { to: string; label: string };

export type RootHandle = {
  breadcrumb: string;
  primaryNav: NavLink[];
};

export type ChildHandle = {
  breadcrumb: string;
};

function Placeholder({ title }: { title: string }) {
  return (
    <div className="card card-padding">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-text-muted">Coming soon.</p>
    </div>
  );
}

const primaryNav: NavLink[] = [
  { to: '/', label: 'Dashboard' },
  { to: '/todos', label: 'Todos' },
  { to: '/habits', label: 'Habits' },
  { to: '/weight', label: 'Weight' },
  { to: '/macros', label: 'Macros' },
  { to: '/meals', label: 'Meals' },
  { to: '/settings', label: 'Settings' },
];

const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPageView />,
  },
  {
    path: '/register',
    element: <RegisterPageView />,
  },
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <RootLayout />,
        handle: {
          breadcrumb: 'Dashboard',
          primaryNav,
        } satisfies RootHandle,
        children: [
          {
            index: true,
            element: <Placeholder title="Dashboard" />,
          },
          {
            path: 'todos',
            element: <Placeholder title="Todos" />,
            handle: { breadcrumb: 'Todos' } satisfies ChildHandle,
          },
          {
            path: 'habits',
            element: <Placeholder title="Habits" />,
            handle: { breadcrumb: 'Habits' } satisfies ChildHandle,
          },
          {
            path: 'weight',
            element: <Placeholder title="Weight" />,
            handle: { breadcrumb: 'Weight' } satisfies ChildHandle,
          },
          {
            path: 'macros',
            element: <Placeholder title="Macros" />,
            handle: { breadcrumb: 'Macros' } satisfies ChildHandle,
          },
          {
            path: 'meals',
            element: <Placeholder title="Meals" />,
            handle: { breadcrumb: 'Meals' } satisfies ChildHandle,
          },
          {
            path: 'settings',
            element: <Placeholder title="Settings" />,
            handle: { breadcrumb: 'Settings' } satisfies ChildHandle,
          },
          {
            path: '*',
            element: <section>Not Found</section>,
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);

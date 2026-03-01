import { RouterProvider, createMemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { router as appRouter } from '../router';
import { render, screen } from '../test/test-utils';

function renderApp(initialEntries: string[]) {
	const testRouter = createMemoryRouter(appRouter.routes, {
		initialEntries,
	});

	return render(<RouterProvider router={testRouter} />);
}

describe('App router', () => {
	it('renders the login page at /login', async () => {
		renderApp(['/login']);

		expect(
			await screen.findByRole('heading', { name: /sign in/i })
		).toBeInTheDocument();
	});

	it('redirects unauthenticated users from / to /login', async () => {
		renderApp(['/']);

		// ProtectedRoute redirects to /login when no token in localStorage
		expect(
			await screen.findByRole('heading', { name: /sign in/i })
		).toBeInTheDocument();
	});
});

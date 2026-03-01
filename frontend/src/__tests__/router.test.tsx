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
	it('renders the home page at /', async () => {
		renderApp(['/']);

		expect(
			await screen.findByRole('heading', { name: /welcome/i })
		).toBeInTheDocument();
	});

	it('renders the contact page at /contact', async () => {
		renderApp(['/contact']);

		expect(
			await screen.findByRole('heading', { name: /contact/i })
		).toBeInTheDocument();
	});
});

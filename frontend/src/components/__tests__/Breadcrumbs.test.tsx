import { createMemoryRouter, Outlet, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '../../test/test-utils';
import { Breadcrumbs } from '../Breadcrumbs';

function LayoutWithBreadcrumbs() {
	return (
		<>
			<Breadcrumbs />
			<Outlet />
		</>
	);
}

function renderBreadcrumbsAt(pathname: string) {
	const router = createMemoryRouter(
		[
			{
				path: '/',
				element: <LayoutWithBreadcrumbs />,
				handle: { breadcrumb: 'Home' }, // only root has "Home"
				children: [
					{
						index: true,
						element: <h1>Home</h1>,
						// no breadcrumb handle here
					},
					{
						path: 'contact',
						element: <h1>Contact</h1>,
						handle: { breadcrumb: 'Contact' },
					},
				],
			},
		],
		{ initialEntries: [pathname] }
	);

	return render(<RouterProvider router={router} />);
}

describe('Breadcrumbs', () => {
	it('shows a breadcrumb for the home route', async () => {
		renderBreadcrumbsAt('/');

		const nav = await screen.findByRole('navigation', {
			name: /breadcrumb/i,
		});

		const items = within(nav).getAllByRole('listitem');
		expect(items).toHaveLength(1);

		expect(within(items[0]).getByText(/home/i)).toBeInTheDocument();
	});

	it('shows a chain for a nested route when handles are defined', async () => {
		renderBreadcrumbsAt('/contact');

		const nav = await screen.findByRole('navigation', {
			name: /breadcrumb/i,
		});

		const items = within(nav).getAllByRole('listitem');
		expect(items).toHaveLength(2);

		// First crumb: Home as link
		expect(
			within(items[0]).getByRole('link', { name: /home/i })
		).toBeInTheDocument();

		// Second crumb: Contact as current page text
		expect(within(items[1]).getByText(/contact/i)).toBeInTheDocument();
	});
});

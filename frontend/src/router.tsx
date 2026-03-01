import { createBrowserRouter, type RouteObject } from 'react-router';
import ContactPage from './routes/contact';
import ErrorPage from './routes/error-page';
import IndexPage, { loader as indexLoader } from './routes/index';
import RootLayout from './routes/root';

export type NavLink = { to: string; label: string };

export type RootHandle = {
	breadcrumb: string;
	primaryNav: NavLink[];
};

export type ChildHandle = {
	breadcrumb: string;
};

const routes: RouteObject[] = [
	{
		path: '/',
		element: <RootLayout />,
		errorElement: <ErrorPage />,
		handle: {
			breadcrumb: 'Home',
			primaryNav: [
				{ to: '/', label: 'Home' },
				{ to: '/contact', label: 'Contact' },
			],
		} satisfies RootHandle,
		children: [
			{
				index: true,
				element: <IndexPage />,
				loader: indexLoader,
			},
			{
				path: 'contact',
				element: <ContactPage />,
				handle: { breadcrumb: 'Contact' } satisfies ChildHandle,
			},
			{
				path: '*',
				element: <section>Not Found</section>,
			},
		],
	},
];

export const router = createBrowserRouter(routes);

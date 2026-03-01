import { Outlet, useMatches } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import type { RootHandle } from '../router';

export default function RootLayout() {
	const matches = useMatches();
	const rootMatch = matches[0];
	const handle = rootMatch?.handle as RootHandle | undefined;

	const primaryNavLinks = handle?.primaryNav ?? [];

	return (
		<div className="app-shell">
			<Header links={primaryNavLinks} />
			<Breadcrumbs className="mt-2" />
			<main className="app-main">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}

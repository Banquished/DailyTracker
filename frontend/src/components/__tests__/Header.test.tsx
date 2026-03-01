import { describe, expect, it } from 'vitest';
import { renderWithRouter, screen } from '../../test/test-utils';
import { Header, type NavItem } from '../Header';

const links: NavItem[] = [
	{ to: '/', label: 'Home' },
	{ to: '/contact', label: 'Contact' },
];

describe('Header', () => {
	it('renders navigation links', () => {
		renderWithRouter(<Header links={links} />);

		expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
	});

	it('highlights the active link based on the current route', () => {
		renderWithRouter(<Header links={links} />, {
			initialEntries: ['/contact'],
		});

		const home = screen.getByRole('link', { name: /home/i });
		const contact = screen.getByRole('link', { name: /contact/i });

		expect(contact.className).toContain('bg-accent');
		expect(home.className).not.toContain('bg-accent');
	});
});

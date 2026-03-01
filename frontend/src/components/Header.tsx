import { Link, NavLink } from 'react-router';

export type NavItem = {
	to: string;
	label: string;
};

type HeaderProps = {
	links: NavItem[];
};

export function Header({ links }: HeaderProps) {
	return (
		<header className="app-header px-4">
			<Link to="/">
                <div className="text-lg font-semibold tracking-tight">
                    My App
                </div>
            </Link>
			<nav className="flex gap-2 text-sm font-medium">
				{links.map((link) => (
					<NavLink
						key={link.to}
						to={link.to}
						className={({ isActive }) =>
							[
								'rounded-md px-3 py-1 transition-colors',
								isActive
									? 'bg-accent text-text-on-accent'
									: 'text-text-muted hover:bg-surface hover:text-text',
							].join(' ')
						}
					>
						{link.label}
					</NavLink>
				))}
			</nav>
		</header>
	);
}

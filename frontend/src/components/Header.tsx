import { Link, NavLink } from 'react-router';

export type NavItem = {
  to: string;
  label: string;
};

type HeaderProps = {
  links: NavItem[];
  onLogout?: () => void;
};

export function Header({ links, onLogout }: HeaderProps) {
  return (
    <header className="app-header px-4">
      <Link to="/">
        <div className="text-lg font-semibold tracking-tight">
          DailyTracker
        </div>
      </Link>
      <nav className="flex items-center gap-2 text-sm font-medium">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
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
        {onLogout !== undefined && (
          <button
            type="button"
            onClick={onLogout}
            className="btn btn-ghost ml-2 text-sm"
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}

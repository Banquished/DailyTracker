import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link, useMatches } from 'react-router';

type BreadcrumbHandle =
    | {
        breadcrumb?: ReactNode | ((match: any) => ReactNode);
    }
    | undefined;

type BreadcrumbsProps = ComponentPropsWithoutRef<'nav'>;

export function Breadcrumbs({ className, ...rest }: BreadcrumbsProps) {
    const matches = useMatches();

    const crumbs = matches
        .filter(match => (match.handle as BreadcrumbHandle)?.breadcrumb)
        .map(match => {
            const handle = match.handle as BreadcrumbHandle;

            let label: ReactNode;
            if (typeof handle?.breadcrumb === "function") {
                label = handle.breadcrumb(match);
            } else {
                label = handle?.breadcrumb;
            }

            return {
                id: match.id,
                pathname: match.pathname,
                label,
            };
        });

    if (crumbs.length === 0) {
        return null
    }

	return (
		<nav
			aria-label="Breadcrumb"
			className={['text-xs text-text-muted', className]
				.filter(Boolean)
				.join(' ')}
			{...rest}
		>
            <ol className='flex flex-wrap items-center gap-2'>
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;

                    return (
                        <li key={crumb.id} className='flex items-center gap-2'>
                            {!isLast ? (
                                <>
                                    <Link 
                                        to={crumb.pathname}
                                        className='hover:text-text underline-offset-2 hover:underline'
                                    >
                                        {crumb.label}
                                    </Link>
                                    <span className='text-text-muted'>/</span>
                                </>
                            ): (
                                <span className='font-medium text-text'>
                                    {crumb.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
		</nav>
	);
}

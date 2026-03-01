import {
    isRouteErrorResponse,
    useRouteError,
} from 'react-router';

export default function ErrorPage() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <section className='space-y-2'>
                <h1 className='text-xl font-semibold'>
                    {error.status} {error.statusText}
                </h1>
                <p className='text-md text-slate-200'>{String(error.data ?? "Something went wrong.")}</p>
            </section>
        )
    };

    if (error instanceof Error) {
        return (
            <section className='space-y-2'>
                <h1 className='text-xl font-semibold'>Unexpected error</h1>
                <pre className='text-md text-red-300'>{error.message}</pre>
            </section>
        );
    }

    return (
        <section>
            <h1 className='text-xl font-semibold'>Unknown error</h1>
        </section>
    );
}

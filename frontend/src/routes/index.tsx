import { useLoaderData } from "react-router";
import HomeFeatures from "../sections/HomeFeatures";
import HomeHero from "../sections/HomeHero";

// eslint-disable-next-line react-refresh/only-export-components
export async function loader() {
    return {
        message: "Hello from the Template App!",
        timestamp: new Date().toISOString(),
    };
}

export type IndexLoaderData = Awaited<ReturnType<typeof loader>>;

export default function IndexPage() {
    const data = useLoaderData<typeof loader>();

    return (
        <>
            <section className="space-y-6">
                <div className="card card-padding space-y-3">
                    <h2>Welcome</h2>
                    <p className="text-sm text-text-muted">
                        {data.message}
                    </p>
                    <small>Loaded at: {data.timestamp}</small>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-primary">
                        Primary Action
                    </button>
                    <button className="btn btn-ghost">
                        Secondary
                    </button>
                </div>
            </section>
            <section className="my-6">
                <HomeHero />
            </section>
            <section className="my-6">
                <HomeFeatures />
            </section>
        </>
    );
}

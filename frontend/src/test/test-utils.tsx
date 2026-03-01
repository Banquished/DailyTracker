import { render, type RenderOptions } from "@testing-library/react";
import userEventLib from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, type MemoryRouterProps } from "react-router";

function AllTheProviders({ children }: { children: ReactNode }) {
    // add global providers here later (store, auth, theme, feature flags, etc...)
    return <>{children}</>;
}

function customRender(
    ui: ReactElement,
    options?: Omit<RenderOptions, "wrapper">
) {
    return render(ui, { wrapper: AllTheProviders, ...options });
}

export function renderWithRouter(
    ui: ReactElement,
    routerProps: MemoryRouterProps = { initialEntries: ["/"] },
    options?: Omit<RenderOptions, "wrapper">
) {
    function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter {...routerProps}>
                <AllTheProviders>{children}</AllTheProviders>
            </MemoryRouter>
        );
    }

    return render(ui, { wrapper: Wrapper, ...options });
}

export * from "@testing-library/react";
export { customRender as render };
export const userEvent = userEventLib;

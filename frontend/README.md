# React + TypeScript + React Router v7 + Tailwind v4 Template

This project is a small, opinionated frontend template built on:

* **Vite** (React + TypeScript)
* **React Router v7 (data mode)**
* **Tailwind CSS v4** with a custom dark navy design system
* **Vitest** + **React Testing Library** + **jest-dom** + **user-event**

It is intended as a starting point for single-page applications with:

* A shared layout (header → breadcrumbs → content → footer)
* A simple but consistent design system
* A basic but useful test setup (components + router)

---

## 1. Project structure

```text
frontend/
  public/
  src/
    components/
      __tests__/
        Breadcrumbs.test.tsx
        Header.test.tsx
      Breadcrumbs.tsx
      Footer.tsx
      Header.tsx

    routes/
      contact.tsx
      error-page.tsx
      index.tsx
      root.tsx          # root layout route (Header + Breadcrumbs + Footer + <Outlet />)

    sections/
      HomeFeatures.tsx
      HomeHero.tsx

    test/
      setupTests.ts     # Vitest / RTL global test setup (jest-dom, etc.)
      test-utils.tsx    # custom render + renderWithRouter helpers

    __tests__/          # integration / router-level tests (recommended)
      router.test.tsx

    main.tsx            # entry point, mounts <RouterProvider /> and imports style.css
    router.tsx          # createBrowserRouter() configuration
    style.css           # Tailwind v4 entry + design system tokens + primitives

  index.html
  package.json
  tsconfig.json
  tsconfig.app.json
  vite.config.ts
```

Notes:

* **Components** live under `src/components/` and are generally route-agnostic.
* **Routes** live under `src/routes/` and are used by React Router (data mode).
* **Sections** are compositional building blocks used inside routes (for example `HomeHero` + `HomeFeatures` in the home page).
* **Tests**:

  * Co-located unit tests for components under `components/__tests__/`.
  * Router / integration tests under `src/__tests__/`.
  * Shared utilities in `src/test/`.

---

## 2. Tech stack

* **Runtime**: React 18 + TypeScript
* **Bundler/dev server**: Vite
* **Routing**: React Router v7 in **data mode** using `createBrowserRouter` and `RouterProvider`
* **Styling**: Tailwind CSS v4, with configuration done directly inside `style.css` via `@theme` and `@layer`
* **Testing**: Vitest + React Testing Library + jest-dom + user-event

Target Node version: **Node 20+**.

---

## 3. Getting started

From the `frontend` directory:

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Run unit/integration tests
npm test

# Watch tests
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Preview production build locally
npm run preview
```

The app is served on the default Vite port (usually `http://localhost:5173`).

---

## 4. Architecture overview

### 4.1 Entry point and router

* `src/main.tsx`

  * Imports the design system CSS (`style.css`).
  * Mounts `<RouterProvider router={router} />` into `#root`.

* `src/router.tsx`

  * Declares the route tree using `createBrowserRouter`.
  * Root route element is `RootLayout` from `src/routes/root.tsx`.
  * Uses `handle.breadcrumb` on routes for breadcrumb labels.

Example (simplified):

```ts
// router.tsx (conceptual)
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    handle: { breadcrumb: "Home" },
    children: [
      {
        index: true,
        element: <IndexPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
        handle: { breadcrumb: "Contact" },
      },
    ],
  },
]);
```

### 4.2 Root layout and shared chrome

* `src/routes/root.tsx` is the **root layout route**.
* It is responsible for the app shell:

  * `Header` (top navigation)
  * `Breadcrumbs` (route-aware breadcrumbs using `useMatches()`)
  * `<Outlet />` (renders child routes)
  * `Footer`

Structurally:

```tsx
export default function RootLayout() {
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
```

The `Header` and `Footer` are route-agnostic components in `src/components/`.

### 4.3 Pages and sections

* **Route modules** under `src/routes/` represent pages:

  * `index.tsx` → home page (index route for `/`).
  * `contact.tsx` → `/contact` page.
  * `error-page.tsx` → route-level error boundary.

* **Sections** under `src/sections/` are building blocks used within pages:

  * `HomeHero.tsx` → hero section for the home page.
  * `HomeFeatures.tsx` → feature list / secondary content.

This separation keeps route modules small and encourages reusability of sections.

### 4.4 Design system (Tailwind v4)

The entire design system is defined in `src/style.css` using Tailwind v4’s single-file configuration model.

Key parts:

1. `@import "tailwindcss";` – enables Tailwind.
2. `@theme { ... }` – defines design tokens:

   * Typography tokens (fonts, heading sizes, line heights).
   * Brand color palette (dark navy background, accent blue, text colors).
   * Radius scale, shadows, durations, breakpoints.
3. `@layer base { ... }` – base element styles:

   * Global `html, body, #root` sizing.
   * Default font (`Inter`) and background / text colors.
   * Heading styles (`h1`–`h4`).
4. `@layer components { ... }` – primitive component classes:

   * Layout helpers: `.app-shell`, `.app-header`, `.app-main`, `.app-footer`.
   * Buttons: `.btn`, `.btn-primary`, `.btn-ghost`.
   * Cards: `.card`, `.card-padding`.
   * Inputs: `.input-root`, `.input-label`, `.input-field`.
   * Badges: `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`.

Tokens defined in `@theme` automatically produce Tailwind utilities (for example `bg-bg`, `bg-surface`, `text-text`, `rounded-lg`, `shadow-md`, `text-h1`, etc.). This keeps the JSX clean and centralises design decisions in one place.

---

## 5. Testing

Testing is handled by **Vitest** and **React Testing Library**.

### 5.1 Configuration

In `vite.config.ts`:

* `environment: "jsdom"` – simulate a browser environment.
* `globals: true` – `describe`, `it`, `expect` available without imports.
* `setupFiles: "./src/test/setupTests.ts"` – global test setup.
* `css: true` – allow importing CSS in components under test.

`src/test/setupTests.ts` imports jest-dom:

```ts
import "@testing-library/jest-dom/vitest";
```

### 5.2 Test utilities

`src/test/test-utils.tsx` exports:

* `render(ui)` – wraps the UI in `AllTheProviders`, which is the place to add future global providers (store, theme, auth, feature flags, etc.).
* `renderWithRouter(ui, routerProps?)` – wraps the UI in a `MemoryRouter` for testing components that rely on routing.
* `userEvent` – re-exported from `@testing-library/user-event`.
* Everything else from `@testing-library/react` for convenience.

Example usage:

```ts
import { renderWithRouter, screen } from "../test/test-utils";
import { Header } from "../components/Header";

it("highlights the active nav link", () => {
  renderWithRouter(<Header links={links} />, { initialEntries: ["/contact"] });

  expect(screen.getByRole("link", { name: /contact/i })).toHaveClass("bg-accent");
});
```

### 5.3 Baseline tests

The template includes three example test files:

1. **`components/__tests__/Header.test.tsx`**

   * Asserts nav links render.
   * Asserts active link styling based on the current route.

2. **`components/__tests__/Breadcrumbs.test.tsx`**

   * Builds a small in-test data router with `createMemoryRouter`.
   * Asserts that breadcrumbs reflect `handle.breadcrumb` for `/` and `/contact`.
   * Uses accessible queries (`getByRole("navigation", { name: /breadcrumb/i })` + `within`).

3. **`__tests__/router.test.tsx`**

   * Uses `createMemoryRouter(router.routes, { initialEntries })` and `<RouterProvider />`.
   * Asserts that visiting `/` renders the home page and `/contact` renders the contact page.

You can use these examples as patterns for additional unit or integration tests.

---

## 6. Extending the template

### 6.1 Adding a new route

1. Create a new route module in `src/routes/`, for example `src/routes/about.tsx`.
2. Implement the page component (using sections if needed).
3. Update `src/router.tsx` to add the route to the root’s `children` array, with an optional `handle.breadcrumb`.
4. Add a nav entry to `Header`’s `primaryNavLinks` if it should appear in the main navigation.

### 6.2 Adding a new section

1. Create a component in `src/sections/`, for example `FeatureGrid.tsx`.
2. Import and use it from one or more route modules.

This keeps the route modules slim and reuses sections across pages.

### 6.3 Customising the design system

To change the look-and-feel:

1. Open `src/style.css`.
2. Adjust tokens under `@theme`:

   * Update `--color-bg`, `--color-surface`, `--color-accent` for a different brand palette.
   * Tweak `--text-h*` and `--leading-h*` for a different typography scale.
   * Adjust radius or shadow tokens for sharper or softer cards/buttons.
3. Tailwind utilities (`bg-bg`, `bg-accent`, `text-text`, etc.) will automatically reflect the new tokens.

Because all primitives (`.btn`, `.card`, `.app-header`, etc.) rely on these tokens, the entire app updates consistently.

### 6.4 Adding global providers

When you introduce global state or theming:

1. Implement the provider(s) (for example a context-based theme provider or a Zustand store provider).
2. Wrap `children` with those providers inside `AllTheProviders` in `src/test/test-utils.tsx` **and** in `src/main.tsx` (for runtime).

This keeps the testing and runtime environments in sync.

---

## 7. Using this as a personal template

To use this project as a template for new apps:

1. Copy the `frontend` directory to a new repo or folder.
2. Update `name`, `version`, and metadata in `package.json`.
3. Rename any project-specific labels in:

   * `Header` (app name, nav labels)
   * `index.tsx` / `contact.tsx` (page titles and content)
   * `style.css` (brand palette, typography)
4. Run `npm install` and `npm run dev` to verify everything works.

From there, add routes, sections, and components as your application grows.

This template is intentionally small and focused: it gives you a robust foundation (routing, design system, testing), but leaves architectural decisions about domains, state management, and data fetching to each individual project.

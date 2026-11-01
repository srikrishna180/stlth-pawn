import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2BB3AC" />
        <Meta />
        <Links />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-1/2 focus:top-0 focus:z-100 focus:-translate-x-1/2 focus:rounded-b-lg focus:bg-teal-500 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let heading = "Something went wrong";
  let detail = "An unexpected error occurred. Please try again, or call us on 0416 273 699.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    heading = error.status === 404 ? "Page not found" : "Something went wrong";
    detail =
      error.status === 404
        ? "That page doesn't exist. Try the menu above, or give us a call."
        : error.statusText || detail;
  } else if (import.meta.env.DEV && error instanceof Error) {
    detail = error.message;
    stack = error.stack;
  }

  return (
    <div className="shell py-24">
      <h1 className="font-display text-4xl font-extrabold text-ink-900">{heading}</h1>
      <p className="mt-3 max-w-prose text-ink-500">{detail}</p>
      <a className="btn btn-primary mt-8" href="/">Back to home</a>
      {stack && (
        <pre className="mt-8 overflow-x-auto rounded-xl bg-ink-900 p-4 text-xs text-white">
          <code>{stack}</code>
        </pre>
      )}
    </div>
  );
}

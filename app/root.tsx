import React from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import stylesheet from "~/styles/app.css?url";
import { LanguageProvider } from "~/locales";
import { ThemeProvider } from "~/hooks/useTheme";
import { AuthProvider } from "~/hooks/useAuth";
import { Provider } from "react-redux";
import { store } from "~/store";
import { ToastProvider } from "~/components/feedback/ToastContext";
import { CartDrawer } from "~/features/cart/CartDrawer";
import { SettingsProvider } from "~/hooks/useSettings";

export const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="no-referrer" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%231a0e08'/%3E%3Cpath d='M32 10 L50 28 L32 54 L14 28 Z' fill='none' stroke='%23d4af37' stroke-width='3.5' stroke-linejoin='round'/%3E%3Cpath d='M32 16 L44 28 L32 46 L20 28 Z' fill='%23d4af37'/%3E%3Ccircle cx='32' cy='28' r='3.5' fill='%23ffffff'/%3E%3C/svg%3E"
        />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col bg-silk-50 text-silk-950 antialiased dark:bg-dark-bg dark:text-silk-100">
        <Provider store={store}>
          <SettingsProvider>
            <LanguageProvider>
              <ThemeProvider>
                <AuthProvider>
                  <ToastProvider>
                    {children}
                    <CartDrawer />
                  </ToastProvider>
                </AuthProvider>
              </ThemeProvider>
            </LanguageProvider>
          </SettingsProvider>
        </Provider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error?: unknown }) {
  let message = "Oops! Something went wrong.";
  let details = "An unexpected error occurred. Please try refreshing.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 - Page Not Found" : "Error";
    details =
      error.status === 404
        ? "The page you are looking for does not exist."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 dark:bg-rose-950/40">
        <span className="text-2xl font-bold">!</span>
      </div>
      <h1 className="text-2xl font-bold text-silk-950 dark:text-silk-50 mb-2">{message}</h1>
      <p className="text-sm text-silk-600 dark:text-silk-400 max-w-md mb-6">{details}</p>
      <a
        href="/"
        className="px-5 py-2.5 rounded-xl bg-silk-950 text-white font-bold hover:bg-gold-500 hover:text-silk-950 transition shadow-sm dark:bg-gold-500 dark:text-silk-950 dark:hover:bg-gold-400"
      >
        Return to Home
      </a>
      {stack && (
        <pre className="mt-6 w-full max-w-2xl text-left p-4 overflow-x-auto text-xs bg-silk-100 rounded-lg text-rose-800 dark:bg-dark-elevated dark:text-rose-300">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

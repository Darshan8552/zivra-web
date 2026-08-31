import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "#/components/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner";

// Dev-only: suppress noisy upstream warnings that don't affect functionality
// - framer-motion `motion() is deprecated. Use motion.create()` (internal factory, still works)
// - motion `hsl(var(--accent) / 0)` animatable color (fixed in mode-toggle, but other libs may log)
if (typeof window !== "undefined" && import.meta.env.DEV) {
  const origWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const first = typeof args[0] === "string" ? args[0] : "";
    if (first.includes("motion() is deprecated")) return;
    if (first.includes("is not an animatable")) return;
    origWarn(...(args as [unknown, ...unknown[]]));
  };
}

interface MyRouterContext {
  queryClient: QueryClient;
}

const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://zivra.app";

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Zivra — Social",
      },
      {
        name: "description",
        content: "Zivra — share moments, follow creators, discover. A production-grade social feed.",
      },
      {
        name: "theme-color",
        content: "#000000",
      },
      {
        property: "og:title",
        content: "Zivra — Social",
      },
      {
        property: "og:description",
        content: "Zivra — share moments, follow creators, discover. A production-grade social feed.",
      },
      {
        property: "og:image",
        content: `${SITE_URL}/og-image.png`,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: SITE_URL,
      },
      {
        property: "og:site_name",
        content: "Zivra",
      },
      {
        property: "og:locale",
        content: "en_US",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "Zivra — Social",
      },
      {
        name: "twitter:description",
        content: "Zivra — share moments, follow creators, discover. A production-grade social feed.",
      },
      {
        name: "twitter:image",
        content: `${SITE_URL}/og-image.png`,
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "canonical",
        href: SITE_URL,
      },
    ],
  }),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <p className="overline text-destructive">Something went wrong</p>
      <h1 className="font-display font-bold text-xl tracking-tight mt-2">
        {(error as Error)?.message || "Unknown error"}
      </h1>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-4 h-9 rounded-full bg-foreground text-background text-sm font-semibold"
        >
          Retry
        </button>
        <Link to="/feed" className="px-4 h-9 rounded-full border border-border text-sm font-semibold inline-flex items-center">
          Home
        </Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <p className="overline text-muted-foreground">404</p>
      <h1 className="font-display font-bold text-2xl tracking-tight mt-2">Page not found</h1>
      <Link to="/feed" className="mt-6 px-4 h-9 rounded-full bg-foreground text-background text-sm font-semibold inline-flex items-center">
        Back to feed
      </Link>
    </div>
  ),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster richColors />
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  );
}

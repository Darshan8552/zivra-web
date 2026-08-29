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

interface MyRouterContext {
  queryClient: QueryClient;
}

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
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
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
        <Scripts />
      </body>
    </html>
  );
}

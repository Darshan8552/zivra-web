import { Link, createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { getContext } from './integrations/tanstack-query/root-provider'

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <p className="overline text-destructive">Something went wrong</p>
      <h1 className="font-display font-bold text-2xl tracking-tight mt-2">{error.message || 'Unknown error'}</h1>
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
  )
}

function DefaultNotFoundComponent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <p className="overline text-muted-foreground">404</p>
      <h1 className="font-display font-bold text-2xl tracking-tight mt-2">Page not found</h1>
      <Link to="/feed" className="mt-6 px-4 h-9 rounded-full bg-foreground text-background text-sm font-semibold inline-flex items-center">
        Back to feed
      </Link>
    </div>
  )
}

export function getRouter() {
  const context = getContext()

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    // Workaround for TanStack #7759: _nonReactive read on evicted preload (intent → click race)
    // Fixed in router-core #7805; keep 'false' until pnpm update pulls fix, then restore 'intent'
    defaultPreload: false,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
    defaultNotFoundComponent: DefaultNotFoundComponent,
  })

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

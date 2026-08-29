import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { BottomNav, Sidebar } from "#/components/Sidebar.tsx";
import { currentUserQueryOptions } from "#/lib/query.options.ts";

export const Route = createFileRoute("/_main")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(
      currentUserQueryOptions,
    );
    if (!user) {
      throw redirect({ to: "/signin" });
    }
    return { user };
  },
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <p className="overline text-destructive">Something went wrong</p>
      <p className="font-display font-semibold mt-2">{(error as Error)?.message || "Failed to load"}</p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-4 h-8 rounded-full bg-foreground text-background text-sm font-semibold"
        >
          Retry
        </button>
        <Link to="/signin" className="px-4 h-8 rounded-full border border-border text-sm font-semibold inline-flex items-center">
          Sign in
        </Link>
      </div>
    </div>
  ),
  component: MainLayout,
});

function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="lg:pl-72 pb-24 lg:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

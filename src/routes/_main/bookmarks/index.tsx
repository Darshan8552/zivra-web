import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, Film } from "lucide-react";
import { useBookmarks } from "#/lib/bookmarks/bookmarks.hooks.ts";

export const Route = createFileRoute("/_main/bookmarks/")({
  component: BookmarksPage,
});

function BookmarksPage() {
  const query = useBookmarks();
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const isEmpty = !query.isLoading && items.length === 0;

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-16 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
            <Bookmark size={18} strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl tracking-tight">Saved</h1>
            <p className="text-sm text-muted-foreground">Only you can see what you’ve saved</p>
          </div>
        </div>

        {query.isLoading ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {["a", "b", "c", "d", "e", "f"].map((k) => (
              <div key={k} className="aspect-square rounded-lg bg-secondary animate-pulse" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-medium text-destructive">Failed to load bookmarks</p>
            <button type="button" onClick={() => void query.refetch()} className="mt-3 text-xs font-semibold px-4 h-8 rounded-full bg-foreground text-background">
              Retry
            </button>
          </div>
        ) : isEmpty ? (
          <div className="py-24 text-center border border-dashed border-border rounded-2xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Bookmark size={20} strokeWidth={1.75} />
            </span>
            <p className="overline text-muted-foreground mt-4">No saved posts yet</p>
            <p className="font-display text-2xl tracking-tight mt-2">When you save posts, they’ll appear here.</p>
            <Link to="/feed" className="mt-6 inline-block text-sm font-semibold text-accent hover:underline">
              Explore feed
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {items.map((post) => {
                const cover = (post as unknown as { media: { url: string; type: string }[] }).media?.[0];
                return (
                  <Link
                    key={post.id}
                    to="/posts/$postId"
                    params={{ postId: post.id }}
                    data-testid={`bookmark-post-${post.id}`}
                    className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer bg-secondary block"
                  >
                    {cover && (
                      <img src={cover.url} alt={post.caption ?? ""} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    {cover?.type === "VIDEO" && (
                      <span className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                        <Film size={12} strokeWidth={1.75} />
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            {query.hasNextPage && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  data-testid="bookmarks-load-more"
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                  className="px-6 h-11 rounded-full border border-border font-semibold text-sm hover:border-foreground transition-colors duration-200 disabled:opacity-40"
                >
                  {query.isFetchingNextPage ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

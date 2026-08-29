import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, SearchIcon, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PostCard } from "#/components/PostCard.tsx";
import { discoverGrid, trendingTopics } from "#/lib/mock.ts";
import { useDebouncedValue } from "#/lib/use-debounced-value.ts";
import {
  useHashtagSuggestions,
  useSearchPosts,
  useSearchUsers,
} from "#/lib/search/search.hooks.ts";
import { useSuggestions, useToggleFollow } from "#/lib/users/users.hooks.ts";
import type { SuggestionUser } from "#/lib/users/users.types.ts";

export const Route = createFileRoute("/_main/search/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q.slice(0, 50) : undefined,
    tab:
      search.tab === "tags"
        ? ("tags" as const)
        : search.tab === "posts"
          ? ("posts" as const)
          : ("people" as const),
  }),
  component: SearchPage,
});

type SearchTab = "people" | "tags" | "posts";

function SearchPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [qInput, setQInput] = useState(search.q ?? "");
  const qDebounced = useDebouncedValue(qInput.trim(), 300);
  const activeTab = search.tab as SearchTab;

  // Keep input in sync with URL (back button, shared link)
  useEffect(() => {
    if ((search.q ?? "") !== qInput) setQInput(search.q ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.q]);

  // Sync debounced q to URL
  useEffect(() => {
    const current = search.q ?? "";
    if (qDebounced === current) return;
    navigate({
      search: ((prev: Record<string, unknown>) => ({
        ...prev,
        q: qDebounced || undefined,
      })) as never,
      replace: true,
    });
  }, [qDebounced, navigate, search.q]);

  const suggestionsQuery = useSuggestions();
  const toggleFollow = useToggleFollow();
  const [followState, setFollowState] = useState<
    Record<string, "following" | "requested" | "idle">
  >({});

  const peopleQuery = useSearchUsers(qDebounced, 12);
  const tagsQuery = useHashtagSuggestions(qDebounced, 12);
  const postsQuery = useSearchPosts(qDebounced, 12);

  // Keep for future generic loading; currently each tab handles its own query
  void (activeTab === "people" ? peopleQuery : activeTab === "tags" ? tagsQuery : postsQuery);

  // For posts infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasNextPage =
    activeTab === "posts"
      ? (postsQuery as ReturnType<typeof useSearchPosts>).hasNextPage
      : false;
  const isFetchingNextPage =
    activeTab === "posts"
      ? (postsQuery as ReturnType<typeof useSearchPosts>).isFetchingNextPage
      : false;

  useEffect(() => {
    if (activeTab !== "posts") return;
    if (!sentinelRef.current) return;
    if (!hasNextPage) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
          void (postsQuery as ReturnType<typeof useSearchPosts>).fetchNextPage();
        }
      },
      { rootMargin: "200px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => {
      observer.unobserve(el);
      observer.disconnect();
    };
  }, [activeTab, hasNextPage, isFetchingNextPage, postsQuery]);

  const switchTab = (tab: SearchTab) => {
    navigate({
      search: ((prev: Record<string, unknown>) => ({ ...prev, tab })) as never,
      replace: true,
    });
  };

  const handleFollow = (s: SuggestionUser) => {
    toggleFollow.mutate(s.username, {
      onSuccess: (data) => {
        setFollowState((prev) => ({
          ...prev,
          [s.id]:
            data.followStatus === "PENDING"
              ? "requested"
              : data.isFollowing
                ? "following"
                : "idle",
        }));
      },
    });
  };

  const avatarUrl = (s: SuggestionUser) => s.avatarUrl ?? undefined;
  const followLabel = (s: SuggestionUser) =>
    followState[s.id] === "requested"
      ? "Requested"
      : followState[s.id] === "following"
        ? "Following"
        : "Follow";

  const isSearching = qDebounced.length > 0;
  const suggestions = suggestionsQuery.data ?? [];

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
      <div className="max-w-[1200px] mx-auto">
        <header className="border-b border-border pb-6 mb-8">
          <p className="overline text-accent">Discover</p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2">
            Search
          </h1>
          <div className="mt-6 relative max-w-2xl">
            <SearchIcon
              size={18}
              strokeWidth={1.75}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              data-testid="search-input"
              placeholder="Look for people, tags, moments…"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-full bg-secondary border border-transparent focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-base transition-colors duration-200"
            />
          </div>

          {/* Tabs — only when searching */}
          {isSearching && (
            <div className="mt-6 border-b border-border">
              <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist">
                {(["people", "tags", "posts"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => switchTab(tab)}
                    data-testid={`search-tab-${tab}`}
                    className={`relative px-4 py-3 text-sm font-display font-semibold tracking-tight capitalize transition-colors duration-200 whitespace-nowrap ${
                      activeTab === tab
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-accent" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {!isSearching ? (
          <>
            {/* Trending — real would be hashtags/suggestions?q=&limit=5, mock fallback for empty */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size={16}
                    strokeWidth={1.75}
                    className="text-accent"
                  />
                  <p className="overline text-muted-foreground">Trending tags</p>
                </div>
                <button
                  type="button"
                  data-testid="trending-see-all"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  See all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((t) => (
                  <button
                    key={t.tag}
                    type="button"
                    data-testid={`trending-${t.tag}`}
                    onClick={() => {
                      setQInput(`#${t.tag}`);
                      switchTab("tags");
                    }}
                    className="group flex items-center gap-2 px-4 h-10 rounded-full bg-secondary hover:bg-foreground hover:text-background transition-colors duration-200"
                  >
                    <span className="font-display font-semibold tracking-tight">#{t.tag}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-background/70">
                      {t.posts}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* People you may know — real */}
            <section className="mb-12">
              <p className="overline text-muted-foreground mb-5">People you may know</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-border p-5 text-center"
                  >
                    <Link
                      to="/users/$username"
                      params={{ username: s.username }}
                      className="flex flex-col items-center"
                    >
                      {avatarUrl(s) ? (
                        <img
                          src={avatarUrl(s)}
                          alt=""
                          className="h-16 w-16 rounded-xl object-cover mx-auto"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-secondary mx-auto" />
                      )}
                      <p className="mt-3 font-display font-semibold text-sm tracking-tight">
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground">@{s.username}</p>
                    </Link>
                    <button
                      type="button"
                      data-testid={`search-follow-${s.id}`}
                      onClick={() => handleFollow(s)}
                      className="mt-4 text-xs font-semibold px-4 h-9 rounded-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-colors duration-200 w-full"
                    >
                      {followLabel(s)}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Editorial picks — mock discoverGrid */}
            <section>
              <p className="overline text-muted-foreground mb-5">Editorial picks · this week</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {discoverGrid.map((src, i) => {
                  const spans = [
                    "",
                    "row-span-2",
                    "",
                    "col-span-2",
                    "",
                    "",
                    "row-span-2",
                    "",
                    "",
                    "col-span-2",
                    "",
                    "",
                  ];
                  return (
                    <div
                      key={i}
                      data-testid={`discover-tile-${i}`}
                      className={`relative overflow-hidden rounded-2xl group cursor-pointer ${spans[i] || ""}`}
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-full h-full object-cover aspect-square min-h-[180px] transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <section>
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Results for{" "}
                <span className="font-semibold text-foreground">"{qDebounced}"</span>
                {" · "}
                <span className="capitalize">{activeTab}</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setQInput("");
                  navigate({ search: {} as never, replace: true });
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>

            {/* People tab */}
            {activeTab === "people" && (
              <>
                {peopleQuery.isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-border p-5 h-40 animate-pulse bg-secondary/50"
                      />
                    ))}
                  </div>
                ) : peopleQuery.isError ? (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                    <p className="text-sm font-medium text-destructive">Failed to search people</p>
                    <button
                      type="button"
                      onClick={() => void peopleQuery.refetch()}
                      className="mt-3 text-xs font-semibold px-4 h-8 rounded-full bg-foreground text-background"
                    >
                      Retry
                    </button>
                  </div>
                ) : (peopleQuery.data?.length ?? 0) === 0 ? (
                  <div className="rounded-2xl border border-border p-8 text-center">
                    <p className="font-display font-semibold">No people for "{qDebounced}"</p>
                    <p className="text-sm text-muted-foreground mt-2">Try another name or username</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {peopleQuery.data?.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-2xl border border-border p-5 text-center"
                      >
                        <Link
                          to="/users/$username"
                          params={{ username: s.username }}
                          className="flex flex-col items-center"
                        >
                          {s.avatarUrl ? (
                            <img
                              src={s.avatarUrl}
                              alt=""
                              className="h-16 w-16 rounded-xl object-cover mx-auto"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-xl bg-secondary mx-auto" />
                          )}
                          <p className="mt-3 font-display font-semibold text-sm tracking-tight">
                            {s.name}
                          </p>
                          <p className="text-xs text-muted-foreground">@{s.username}</p>
                          {s.isVerified && (
                            <span className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                              Verified
                            </span>
                          )}
                        </Link>
                        <button
                          type="button"
                          data-testid={`search-people-follow-${s.id}`}
                          onClick={() =>
                            handleFollow({
                              id: s.id,
                              name: s.name,
                              username: s.username,
                              avatarUrl: s.avatarUrl,
                              isVerified: s.isVerified,
                              isPrivate: false,
                              reason: "",
                            } as SuggestionUser)
                          }
                          className="mt-4 text-xs font-semibold px-4 h-9 rounded-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-colors duration-200 w-full"
                        >
                          {followLabel({
                            id: s.id,
                            name: s.name,
                            username: s.username,
                            avatarUrl: s.avatarUrl,
                            isVerified: s.isVerified,
                            isPrivate: false,
                            reason: "",
                          } as SuggestionUser)}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Tags tab */}
            {activeTab === "tags" && (
              <>
                {tagsQuery.isLoading ? (
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-10 w-24 rounded-full bg-secondary animate-pulse" />
                    ))}
                  </div>
                ) : tagsQuery.isError ? (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                    <p className="text-sm font-medium text-destructive">Failed to search tags</p>
                    <button
                      type="button"
                      onClick={() => void tagsQuery.refetch()}
                      className="mt-3 text-xs font-semibold px-4 h-8 rounded-full bg-foreground text-background"
                    >
                      Retry
                    </button>
                  </div>
                ) : (tagsQuery.data?.length ?? 0) === 0 ? (
                  <div className="rounded-2xl border border-border p-8 text-center">
                    <p className="font-display font-semibold">No tags for "{qDebounced}"</p>
                    <p className="text-sm text-muted-foreground mt-2">Try without # or another term</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tagsQuery.data?.map((h) => (
                      <Link
                        key={h.id}
                        to="/search"
                        search={{ q: h.name, tab: "posts" } as never}
                        data-testid={`search-tag-${h.name}`}
                        className="group flex items-center gap-2 px-4 h-10 rounded-full bg-secondary hover:bg-foreground hover:text-background transition-colors duration-200"
                      >
                        <span className="font-display font-semibold tracking-tight">#{h.name}</span>
                        <span className="text-xs text-muted-foreground group-hover:text-background/70">
                          {h.postCount} posts
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Posts tab */}
            {activeTab === "posts" && (
              <>
                {postsQuery.isLoading ? (
                  <div className="space-y-6">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-96 rounded-2xl bg-secondary animate-pulse" />
                    ))}
                  </div>
                ) : postsQuery.isError ? (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                    <p className="text-sm font-medium text-destructive">Failed to search posts</p>
                    <button
                      type="button"
                      onClick={() => void postsQuery.refetch()}
                      className="mt-3 text-xs font-semibold px-4 h-8 rounded-full bg-foreground text-background"
                    >
                      Retry
                    </button>
                  </div>
                ) : (postsQuery.data?.pages.flatMap((p) => p.items).length ?? 0) === 0 ? (
                  <div className="rounded-2xl border border-border p-8 text-center">
                    <p className="font-display font-semibold">No posts for "{qDebounced}"</p>
                    <p className="text-sm text-muted-foreground mt-2">Try caption or hashtag without #</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {postsQuery.data?.pages
                      .flatMap((p) => p.items)
                      .map((post) => (
                        <PostCard key={post.id} post={post} currentUserId={undefined} />
                      ))}

                    <div ref={sentinelRef} className="h-1" />

                    {postsQuery.isFetchingNextPage && (
                      <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin text-muted-foreground" size={20} />
                      </div>
                    )}

                    {!postsQuery.hasNextPage &&
                      (postsQuery.data?.pages.flatMap((p) => p.items).length ?? 0) > 0 && (
                        <p className="text-center text-xs text-muted-foreground overline py-4">
                          You're all caught up
                        </p>
                      )}

                    {postsQuery.hasNextPage && !postsQuery.isFetchingNextPage && (
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => void postsQuery.fetchNextPage()}
                          className="text-xs font-semibold px-4 h-8 rounded-full border border-border hover:bg-secondary transition-colors"
                        >
                          Load more
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

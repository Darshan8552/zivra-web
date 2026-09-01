import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar } from "#/components/ui/avatar.tsx";
import { CreateStoryDialog } from "#/components/story/CreateStoryDialog.tsx";
import { StoryViewer } from "#/components/story/StoryViewer.tsx";
import { currentUser, stories as mockStories } from "#/lib/mock.ts";
import { currentUserQueryOptions } from "#/lib/query.options.ts";
import { useStoriesFeed } from "#/lib/stories/stories.hooks.ts";
import type { StoryGroup } from "#/lib/stories/stories.types.ts";

export interface StoryBarProps {
  limit?: number;
  onSelectGroup?: (group: StoryGroup, index: number) => void;
  /** if true, feed controls viewer externally; when undefined StoryBar manages its own viewer */
  externalControl?: boolean;
}

const ENABLE_STORIES = import.meta.env.VITE_ENABLE_STORIES !== "false";

export function StoryBar({ limit = 20, onSelectGroup, externalControl }: StoryBarProps) {
  const { data, isLoading, isError, refetch, isFetching } = useStoriesFeed(limit);
  const { data: me } = useQuery(currentUserQueryOptions);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const groups: StoryGroup[] = data?.pages.flatMap((p) => p.groups) ?? [];
  const showMockFallback = isError && groups.length === 0;

  // Instagram-like: your story lives inside the first tile, not as separate outlet
  const meGroupIdx = groups.findIndex(
    (g) => (me?.id && g.user.id === me.id) || (me?.username && g.user.username === me.username),
  );
  const meGroup: StoryGroup | null = meGroupIdx >= 0 ? groups[meGroupIdx] : null;
  const otherGroups: StoryGroup[] = meGroupIdx >= 0 ? groups.filter((_, i) => i !== meGroupIdx) : groups;
  const hasOwnStory = !!meGroup && meGroup.stories.length > 0;
  const canAddMore = !meGroup || meGroup.stories.length < 10;

  // when externalControl is true, we delegate viewer to parent via onSelectGroup
  const handleSelect = (g: StoryGroup, idx: number) => {
    if (onSelectGroup) {
      onSelectGroup(g, idx);
      return;
    }
    if (externalControl) return;
    setActiveIdx(idx);
  };

  const handleCreateClick = () => {
    if (hasOwnStory && !canAddMore) {
      toast.error("You’ve reached 10 stories for today");
      return;
    }
    setCreateOpen(true);
  };

  const handleYourStoryView = () => {
    if (!meGroup || !hasOwnStory) {
      handleCreateClick();
      return;
    }
    handleSelect(meGroup, meGroupIdx);
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCreateClick();
  };

  // if stories disabled via flag, just render mock (like original)
  if (!ENABLE_STORIES && !isError) {
    // still try real feed, but allow mock fallback quickly
  }

  return (
    <>
      <section aria-label="Stories" className="w-full overflow-x-auto no-scrollbar py-1">
        <h2 className="sr-only">Stories</h2>
        <div role="list" className="flex gap-3 min-w-max py-1">
          {/* Your story — merged create+view like Instagram */}
          <div role="listitem">
            {hasOwnStory && meGroup ? (
              (() => {
                const first = meGroup.stories[0];
                const isVideo = first?.type === "VIDEO";
                const cover = first?.mediaUrl;
                return (
                  <button
                    type="button"
                    data-testid="story-create"
                    aria-label={`View your story${meGroup.seenAll ? " - seen" : ""}`}
                    onClick={handleYourStoryView}
                    className="group relative w-[110px] h-[170px] rounded-2xl overflow-hidden flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    {cover ? (
                      isVideo ? (
                        <video
                          src={cover}
                          muted
                          playsInline
                          preload="metadata"
                          aria-hidden="true"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <img src={cover} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
                      )
                    ) : (
                      <img
                        src={me?.avatarUrl ?? currentUser.avatar}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div
                      className={`absolute inset-0 rounded-2xl border-2 pointer-events-none ${meGroup.seenAll ? "border-transparent" : "border-accent"}`}
                    />
                    <div className="absolute top-2 left-2">
                      <Avatar
                        src={me?.avatarUrl ?? currentUser.avatar}
                        name={me?.name ?? currentUser.name}
                        username={me?.username ?? currentUser.username}
                        size="sm"
                        shape="circle"
                        className="h-8 w-8 rounded-full border-2 border-background shadow-sm"
                      />
                      <button
                        type="button"
                        data-testid="story-create-plus"
                        aria-label="Add to your story"
                        onClick={handlePlusClick}
                        className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-accent border-2 border-background flex items-center justify-center text-accent-foreground hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Plus size={10} strokeWidth={2.5} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 text-left">
                      <p className="text-xs font-display font-semibold tracking-tight text-white truncate">Your story</p>
                    </div>
                  </button>
                );
              })()
            ) : (
              <button
                type="button"
                data-testid="story-create"
                aria-label="Create story"
                onClick={handleCreateClick}
                className="group relative w-[110px] h-[170px] rounded-2xl overflow-hidden border border-border bg-secondary flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <img
                  src={me?.avatarUrl ?? currentUser.avatar}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute top-2 left-2 h-8 w-8 rounded-full bg-accent flex items-center justify-center border-2 border-background">
                  <Plus size={16} strokeWidth={2} aria-hidden="true" className="text-accent-foreground" />
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-left">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/80">New</p>
                  <p className="text-sm font-display font-semibold tracking-tight text-white">Your story</p>
                </div>
              </button>
            )}
          </div>

          {isLoading ? (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  role="listitem"
                  className="w-[110px] h-[170px] rounded-2xl overflow-hidden border border-border bg-secondary flex-shrink-0 animate-pulse"
                  aria-hidden="true"
                >
                  <div className="h-full w-full bg-secondary" />
                </div>
              ))}
            </>
          ) : showMockFallback ? (
            <>
              {mockStories.map((s) => (
                <div key={s.id} role="listitem">
                  <button
                    type="button"
                    data-testid={`story-${s.id}`}
                    aria-label={`View ${s.user}'s story${s.seen ? " - seen" : ""}`}
                    onClick={() => {
                      // mock click still shows a toast-like no-op; keep UX
                    }}
                    className="group relative w-[110px] h-[170px] rounded-2xl overflow-hidden flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    <img src={s.preview} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className={`absolute inset-0 rounded-2xl border-2 ${s.seen ? "border-transparent" : "border-accent"}`} />
                    <img
                      src={s.avatar}
                      alt=""
                      aria-hidden="true"
                      className="absolute top-2 left-2 h-8 w-8 rounded-full object-cover border-2 border-background"
                    />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-display font-semibold tracking-tight text-white truncate">@{s.user}</p>
                    </div>
                  </button>
                </div>
              ))}
              <div role="listitem" className="flex items-center">
                <button
                  type="button"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                  className="text-xs font-semibold px-3 h-8 rounded-full border border-border hover:bg-secondary transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isFetching ? <Loader2 size={12} className="animate-spin" /> : null} Retry
                </button>
              </div>
            </>
          ) : isError ? (
            <div role="listitem" className="flex items-center gap-2 py-6">
              <p className="text-xs text-muted-foreground">Failed to load stories</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="text-xs font-semibold px-3 h-8 rounded-full bg-foreground text-background"
              >
                Retry
              </button>
            </div>
          ) : groups.length === 0 ? (
            <div role="listitem" className="flex items-center">
              <p className="text-xs text-muted-foreground px-2 py-6">No stories yet — create one</p>
            </div>
          ) : (
            otherGroups.map((g) => {
              const first = g.stories[0];
              const isVideo = first?.type === "VIDEO";
              const cover = first?.mediaUrl;
              const originalIdx = groups.findIndex((gr) => gr.user.id === g.user.id);
              const handleClick = () => handleSelect(g, originalIdx >= 0 ? originalIdx : 0);
              return (
                <div key={g.user.id} role="listitem">
                  <button
                    type="button"
                    data-testid={`story-${first?.id ?? g.user.id}`}
                    aria-label={`View ${g.user.username}'s story${g.seenAll ? " - seen" : ""}`}
                    onClick={handleClick}
                    className="group relative w-[110px] h-[170px] rounded-2xl overflow-hidden flex-shrink-0 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    {cover ? (
                      isVideo ? (
                        <video
                          src={cover}
                          muted
                          playsInline
                          preload="metadata"
                          aria-hidden="true"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <img src={cover} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
                      )
                    ) : (
                      <div className="absolute inset-0 bg-secondary" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div
                      className={`absolute inset-0 rounded-2xl border-2 pointer-events-none ${g.seenAll ? "border-transparent" : "border-accent"}`}
                    />
                    <div className="absolute top-2 left-2">
                      <Avatar
                        src={g.user.avatarUrl}
                        name={g.user.name}
                        username={g.user.username}
                        size="sm"
                        shape="circle"
                        className="h-8 w-8 rounded-full border-2 border-background shadow-sm"
                      />
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-display font-semibold tracking-tight text-white truncate">@{g.user.username}</p>
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      <CreateStoryDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Internal viewer when not externally controlled */}
      {!externalControl && !onSelectGroup && groups.length > 0 && activeIdx !== null && groups[activeIdx] && (
        <StoryViewer
          open={activeIdx !== null}
          groups={groups}
          initialGroupIndex={activeIdx}
          onClose={() => setActiveIdx(null)}
          currentUserId={me?.id}
        />
      )}
    </>
  );
}

export default StoryBar;

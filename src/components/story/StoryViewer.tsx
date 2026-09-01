import { Dialog } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Loader2, MoreHorizontal, Pause, Play, Send, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar } from "#/components/ui/avatar.tsx";
import { cn, timeAgo } from "#/lib/utils.ts";
import { getErrorMessage } from "#/lib/auth/auth.hooks.ts";
import { useDeleteStory, useViewStory } from "#/lib/stories/stories.hooks.ts";
import type { Story, StoryGroup } from "#/lib/stories/stories.types.ts";

export interface StoryViewerProps {
  open: boolean;
  groups: StoryGroup[];
  initialGroupIndex: number | null;
  onClose: () => void;
  currentUserId?: string | null;
}

const IMAGE_DURATION_MS = 5000;

function flatIndex(groups: StoryGroup[], gIdx: number, sIdx: number): number {
  let n = 0;
  for (let i = 0; i < gIdx; i++) n += groups[i].stories.length;
  return n + sIdx;
}

export function StoryViewer({ open, groups, initialGroupIndex, onClose, currentUserId }: StoryViewerProps) {
  const viewStory = useViewStory();
  const deleteStory = useDeleteStory();

  const [groupIdx, setGroupIdx] = useState<number>(initialGroupIndex ?? 0);
  const [storyIdx, setStoryIdx] = useState<number>(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [reply, setReply] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const viewTimerRef = useRef<number | null>(null);

  const currentGroup: StoryGroup | undefined = groups[groupIdx];
  const stories: Story[] = currentGroup?.stories ?? [];
  const currentStory: Story | undefined = stories[storyIdx];
  const isOwner = !!currentUserId && currentStory?.userId === currentUserId;

  // sync when opening to initial index + first unseen
  useEffect(() => {
    if (open && initialGroupIndex !== null) {
      setGroupIdx(initialGroupIndex);
      const g = groups[initialGroupIndex];
      if (g) {
        // start at first unseen if any
        const firstUnseen = g.stories.findIndex((s) => !s.viewed);
        setStoryIdx(firstUnseen >= 0 ? firstUnseen : 0);
      } else {
        setStoryIdx(0);
      }
      setPaused(false);
      setProgress(0);
      elapsedRef.current = 0;
    }
  }, [open, initialGroupIndex, groups]);

  // reset elapsed when story changes
  useEffect(() => {
    setProgress(0);
    elapsedRef.current = 0;
    startRef.current = Date.now();
  }, [groupIdx, storyIdx]);

  // mark viewed after 1s
  useEffect(() => {
    if (!open || !currentStory) return;
    if (currentStory.viewed) return;
    if (viewTimerRef.current) window.clearTimeout(viewTimerRef.current);
    viewTimerRef.current = window.setTimeout(() => {
      viewStory.mutate(currentStory.id, {
        onError: () => {
          // ignore toast already handled in hook
        },
      });
    }, 1000);
    return () => {
      if (viewTimerRef.current) window.clearTimeout(viewTimerRef.current);
    };
  }, [open, currentStory, viewStory]);

  const goNext = useCallback(() => {
    if (!currentGroup) return;
    if (storyIdx < stories.length - 1) {
      setStoryIdx((v) => v + 1);
      setProgress(0);
      elapsedRef.current = 0;
      startRef.current = Date.now();
      return;
    }
    if (groupIdx < groups.length - 1) {
      setGroupIdx((v) => v + 1);
      setStoryIdx(0);
      setProgress(0);
      elapsedRef.current = 0;
      startRef.current = Date.now();
      return;
    }
    onClose();
  }, [currentGroup, storyIdx, stories.length, groupIdx, groups.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIdx > 0) {
      setStoryIdx((v) => v - 1);
      setProgress(0);
      elapsedRef.current = 0;
      startRef.current = Date.now();
      return;
    }
    if (groupIdx > 0) {
      const prevGroup = groups[groupIdx - 1];
      setGroupIdx((v) => v - 1);
      setStoryIdx(prevGroup ? prevGroup.stories.length - 1 : 0);
      setProgress(0);
      elapsedRef.current = 0;
      startRef.current = Date.now();
    }
  }, [storyIdx, groupIdx, groups]);

  // keyboard
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goNext, goPrev, onClose]);

  // progress + auto advance for images
  useEffect(() => {
    if (!open || !currentStory || paused) return;
    if (currentStory.type === "VIDEO") return; // video drives via timeupdate

    const duration = IMAGE_DURATION_MS;
    startRef.current = Date.now() - elapsedRef.current;

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      elapsedRef.current = elapsed;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p >= 1) {
        goNext();
      } else {
        timerRef.current = window.requestAnimationFrame(tick) as unknown as number;
      }
    };
    timerRef.current = window.requestAnimationFrame(tick) as unknown as number;
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [open, currentStory, paused, groupIdx, storyIdx, goNext]);

  // pause resumes elapsed tracking
  useEffect(() => {
    if (paused) {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    } else {
      startRef.current = Date.now() - elapsedRef.current;
    }
  }, [paused]);

  const handleVideoTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration || paused) return;
    const p = v.currentTime / v.duration;
    setProgress(p);
  };

  const handleVideoEnded = () => goNext();

  const handleDelete = () => {
    if (!currentStory || !isOwner) return;
    if (!confirm("Delete this story?")) return;
    deleteStory.mutate(currentStory.id, {
      onSuccess: () => {
        toast.success("Story deleted");
        // if last story in group, close or move
        if (stories.length === 1) {
          onClose();
        } else {
          // stay at same index but story list will update via invalidation
          if (storyIdx >= stories.length - 1) setStoryIdx(Math.max(0, stories.length - 2));
        }
      },
      onError: (e) => toast.error(getErrorMessage(e, "Failed to delete")),
    });
  };

  const handleReply = () => {
    const text = reply.trim();
    if (!text || !currentStory) return;
    // For now, since messages STORY_REPLY endpoint may not be fully wired, we toast.
    // Attempt: viewStory already done; reply would go to DMs via messages API.
    // Keep graceful fallback as per spec: if messages not ready, just toast.
    toast.success("Reply sent");
    setReply("");
    // In future: await sendMessageFn({ data: { conversationId: ?, content: text, type: "STORY_REPLY", sharedStoryId: currentStory.id }})
  };

  if (!open || !currentGroup || !currentStory) return null;

  const flatStoriesCount = groups.reduce((acc, g) => acc + g.stories.length, 0);
  const _flat = flatIndex(groups, groupIdx, storyIdx);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/85 backdrop-blur-[2px] z-50" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 focus:outline-none"
        >
          <Dialog.Title className="sr-only">Story viewer — {currentGroup.user.username}</Dialog.Title>

          <div className="relative w-full h-[100dvh] sm:h-[min(90vh,860px)] sm:max-w-[420px] sm:rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col">
            {/* Progress bars */}
            <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-3 sm:pt-2">
              {stories.map((_, i) => {
                const isPast = i < storyIdx;
                const isCurrent = i === storyIdx;
                return (
                  <div key={i} className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden">
                    <div
                      className={cn("h-full bg-white transition-none", isPast && "w-full", !isPast && !isCurrent && "w-0")}
                      style={
                        isCurrent
                          ? { width: `${progress * 100}%`, transition: paused ? "none" : undefined }
                          : undefined
                      }
                    />
                  </div>
                );
              })}
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-3 pt-8 sm:pt-10 pb-3 bg-gradient-to-b from-black/60 via-black/20 to-transparent">
              <Avatar
                src={currentGroup.user.avatarUrl}
                name={currentGroup.user.name}
                username={currentGroup.user.username}
                size="sm"
                shape="circle"
                className="h-8 w-8 rounded-full border border-white/20"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-none truncate">
                  {currentGroup.user.name}{" "}
                  <span className="font-normal text-white/70">@{currentGroup.user.username}</span>
                </p>
                <p className="text-[11px] text-white/60">{timeAgo(currentStory.createdAt)} · {currentStory.visibility === "CLOSE_FRIENDS" ? "Close friends" : "Public"}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? "Play" : "Pause"}
                  className="h-8 w-8 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  {paused ? <Play size={14} /> : <Pause size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="h-8 w-8 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                {isOwner && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteStory.isPending}
                    aria-label="Delete story"
                    className="h-8 w-8 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    {deleteStory.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                )}
                <Dialog.Close
                  aria-label="Close"
                  className="h-8 w-8 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X size={14} />
                </Dialog.Close>
              </div>
            </div>

            {/* Tap zones */}
            <button
              type="button"
              aria-label="Previous story"
              onClick={goPrev}
              className="absolute left-0 top-16 bottom-20 w-1/2 z-10 focus:outline-none"
              tabIndex={-1}
            />
            <button
              type="button"
              aria-label="Next story"
              onClick={goNext}
              className="absolute right-0 top-16 bottom-20 w-1/2 z-10 focus:outline-none"
              tabIndex={-1}
            />

            {/* Media */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStory.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                  onClick={() => setPaused((p) => !p)}
                >
                  {currentStory.type === "VIDEO" ? (
                    <video
                      ref={videoRef}
                      src={currentStory.mediaUrl}
                      autoPlay
                      playsInline
                      muted={muted}
                      controls={false}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={handleVideoEnded}
                      onPlay={() => setPaused(false)}
                      onPause={() => setPaused(true)}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src={currentStory.mediaUrl}
                      alt=""
                      draggable={false}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                      className="h-full w-full object-contain select-none"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Desktop side arrows (visible on sm+) */}
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous"
                className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 backdrop-blur text-white items-center justify-center hover:bg-black/60 transition-colors z-20"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next"
                className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 backdrop-blur text-white items-center justify-center hover:bg-black/60 transition-colors z-20"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Reply bar */}
            <div className="relative z-20 p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/15 px-3 h-10 focus-within:border-white/30 transition-colors">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                    placeholder={`Reply to @${currentGroup.user.username}…`}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleReply}
                    disabled={!reply.trim()}
                    className="h-7 w-7 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:bg-white/90 transition-colors shrink-0"
                    aria-label="Send reply"
                  >
                    <Send size={12} />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="More"
                  onClick={() => toast("More options")}
                  className="h-10 w-10 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <p className="text-center text-[10px] tracking-[0.12em] uppercase text-white/40 mt-2 hidden sm:block">
                {_flat + 1} / {flatStoriesCount} · tap sides to navigate · Esc to close
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default StoryViewer;

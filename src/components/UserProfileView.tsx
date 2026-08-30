import {
  Bookmark,
  Calendar,
  Film,
  Grid,
  LinkIcon,
  Lock,
  MapPin,
  MessageCircle,
  Settings,
  Tag,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  type ProfilePostsTab,
  useProfilePosts,
  useToggleFollow,
} from "#/lib/users/users.hooks.ts";
import { useCreateConversation } from "#/lib/chat/chat.hooks.ts";
import type { UserProfile } from "#/lib/users/users.types.ts";

const tabs: { id: ProfilePostsTab; label: string; icon: typeof Grid }[] = [
  { id: "posts", label: "Posts", icon: Grid },
  { id: "tagged", label: "Tagged", icon: Tag },
];

function formatJoinedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function UserProfileView({
  user,
  isSelf,
}: {
  user: UserProfile;
  isSelf: boolean;
}) {
  const [tab, setTab] = useState<ProfilePostsTab>("posts");
  const canViewPosts = isSelf || !user.isPrivate || user.isFollowing;
  const postsQuery = useProfilePosts(user.username, tab, canViewPosts);
  const toggleFollow = useToggleFollow();
  const createConversation = useCreateConversation();
  const navigate = useNavigate();

  const handleMessage = () => {
    createConversation.mutate(
      { participantIds: [user.id] },
      {
        onSuccess: (conv) => {
          navigate({ to: '/chat', search: { conversationId: conv.id } as unknown as never });
        },
      },
    );
  };

  const items = postsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const isEmpty = !postsQuery.isLoading && items.length === 0;

  const followLabel = toggleFollow.isPending
    ? "…"
    : user.followStatus === "PENDING"
      ? "Requested"
      : user.isFollowing
        ? "Following"
        : "Follow";

  return (
    <div>
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-16">
        <div className="max-w-4xl mx-auto">
          {}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl object-cover border-4 border-background"
              />
            ) : (
              <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-3xl bg-secondary border-4 border-background" />
            )}
            <div className="flex gap-2 pb-2">
              {isSelf ? (
                <>
                  <Link
                    to="/profile/edit"
                    data-testid="profile-edit-btn"
                    className="px-5 h-11 rounded-full border border-border font-semibold text-sm flex items-center hover:border-foreground transition-colors duration-200"
                  >
                    Edit profile
                  </Link>
                  <Link
                    to="/bookmarks"
                    data-testid="profile-bookmarks-btn"
                    className="h-11 w-11 rounded-full border border-border flex items-center justify-center hover:border-foreground transition-colors duration-200"
                  >
                    <Bookmark size={16} strokeWidth={1.75} />
                  </Link>
                  <Link
                    to="/settings"
                    search={{ tab: "privacy" }}
                    data-testid="profile-settings-btn"
                    className="h-11 w-11 rounded-full border border-border flex items-center justify-center hover:border-foreground transition-colors duration-200"
                  >
                    <Settings size={16} strokeWidth={1.75} />
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    data-testid="profile-follow-btn"
                    onClick={() => toggleFollow.mutate(user.username)}
                    disabled={toggleFollow.isPending}
                    className="px-5 h-11 rounded-full bg-foreground text-background font-semibold text-sm flex items-center gap-1.5 hover:bg-accent hover:text-accent-foreground transition-colors duration-200 disabled:opacity-60"
                  >
                    {!user.isFollowing && user.followStatus !== "PENDING" && (
                      <UserPlus size={15} strokeWidth={2} />
                    )}
                    {followLabel}
                  </button>
                  <button
                    type="button"
                    data-testid="profile-message-btn"
                    onClick={handleMessage}
                    disabled={createConversation.isPending}
                    className="px-5 h-11 rounded-full bg-secondary text-foreground font-semibold text-sm flex items-center gap-1.5 hover:bg-accent hover:text-accent-foreground border border-transparent hover:border-border transition-colors duration-200 disabled:opacity-60"
                  >
                    <MessageCircle size={15} strokeWidth={2} />
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          {}
          <div className="mt-6">
            <h1 className="font-display font-bold text-4xl tracking-tight">
              {user.name}
            </h1>
            <p className="text-muted-foreground mt-1">@{user.username}</p>
            {user.bio && (
              <p className="mt-5 text-[15px] leading-relaxed max-w-xl">
                {user.bio}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-accent transition-colors duration-200"
                >
                  <LinkIcon size={14} strokeWidth={1.75} /> {user.website}
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={14} strokeWidth={1.75} /> Joined{" "}
                {formatJoinedDate(user.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                {user.location && (
                  <>
                    <MapPin size={14} strokeWidth={1.75} />
                    {user.location}
                  </>
                )}
              </span>
            </div>

            <div className="mt-6 flex gap-6 text-sm">
              <Link
                to="/users/$username/followers-following"
                params={{ username: user.username }}
                search={{ tab: "following" }}
                data-testid="profile-stat-following"
                className="hover:text-accent transition-colors duration-200"
              >
                <span className="font-display font-bold text-base mr-1">
                  {user.followingCount}
                </span>
                <span className="text-muted-foreground">Following</span>
              </Link>
              <Link
                to="/users/$username/followers-following"
                params={{ username: user.username }}
                search={{ tab: "followers" }}
                data-testid="profile-stat-followers"
                className="hover:text-accent transition-colors duration-200"
              >
                <span className="font-display font-bold text-base mr-1">
                  {user.followerCount.toLocaleString()}
                </span>
                <span className="text-muted-foreground">Followers</span>
              </Link>
              <div>
                <span className="font-display font-bold text-base mr-1">
                  {user.postCount}
                </span>
                <span className="text-muted-foreground">Posts</span>
              </div>
            </div>
          </div>

          {}
          <div className="mt-10 border-b border-border flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((t) => (
              <button
                type="button"
                key={t.id}
                data-testid={`profile-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-display font-semibold tracking-tight transition-colors duration-200 ${
                  tab === t.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon size={14} strokeWidth={1.75} />
                {t.label}
                {tab === t.id && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent" />
                )}
              </button>
            ))}
          </div>

          {}
          <section className="mt-8 pb-16">
            {!canViewPosts ? (
              <div className="py-24 text-center border border-dashed border-border rounded-2xl">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <Lock size={20} strokeWidth={1.75} />
                </span>
                <p className="overline text-muted-foreground mt-4">
                  Private account
                </p>
                <p className="font-display text-2xl tracking-tight mt-2">
                  Follow to see their posts
                </p>
              </div>
            ) : postsQuery.isLoading ? (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {["a", "b", "c", "d", "e", "f"].map((skeletonKey) => (
                  <div
                    key={skeletonKey}
                    className="aspect-square rounded-lg bg-secondary animate-pulse"
                  />
                ))}
              </div>
            ) : isEmpty ? (
              <div className="py-24 text-center border border-dashed border-border rounded-2xl">
                <p className="overline text-muted-foreground">
                  Nothing here yet
                </p>
                <p className="font-display text-2xl tracking-tight mt-2">
                  {isSelf && tab === "posts" ? (
                    <>
                      No posts yet.{" "}
                      <Link
                        to="/create"
                        className="text-accent hover:underline"
                      >
                        Share your first one
                      </Link>
                    </>
                  ) : tab === "posts" ? (
                    "No posts yet."
                  ) : (
                    "Posts they're tagged in will show up here."
                  )}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {items.map((post) => {
                    const cover = post.media[0];
                    return (
                      <Link
                        key={post.id}
                        to="/posts/$postId"
                        params={{ postId: post.id }}
                        data-testid={`profile-post-${post.id}`}
                        className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer bg-secondary block"
                      >
                        {cover && (
                          <img
                            src={cover.url}
                            alt={post.caption ?? ""}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
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

                {postsQuery.hasNextPage && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      data-testid="profile-load-more"
                      onClick={() => postsQuery.fetchNextPage()}
                      disabled={postsQuery.isFetchingNextPage}
                      className="px-6 h-11 rounded-full border border-border font-semibold text-sm hover:border-foreground transition-colors duration-200 disabled:opacity-40"
                    >
                      {postsQuery.isFetchingNextPage
                        ? "Loading..."
                        : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
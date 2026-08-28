import { UserPlus, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useToggleFollow } from "#/lib/users/users.hooks.ts";
import type { FollowUser } from "#/lib/users/users.types.ts";

interface FollowUserCardProps {
  user: FollowUser;
  isOwnProfile: boolean;
  isFollowersTab: boolean;
}

export function FollowUserCard({
  user,
  isOwnProfile,
  isFollowersTab,
}: FollowUserCardProps) {
  const toggleFollow = useToggleFollow();

  const followLabel = toggleFollow.isPending
    ? "..."
    : user.followStatus === "PENDING"
      ? "Requested"
      : user.isFollowing
        ? "Following"
        : "Follow";

  const showFollowButton = !isOwnProfile || (isOwnProfile && isFollowersTab && !user.isFollowing);

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-secondary/50 rounded-xl transition-colors">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-secondary" />
      )}
      <div className="flex-1 min-w-0">
        <Link
          to="/users/$username"
          params={{ username: user.username }}
          className="flex items-center gap-2 truncate"
        >
          <span className="font-semibold truncate">{user.name}</span>
          <span className="text-muted-foreground truncate">@{user.username}</span>
          {user.isVerified && (
            <span className="text-accent" aria-label="Verified">✓</span>
          )}
        </Link>
      </div>
      {showFollowButton && (
        <button
          type="button"
          onClick={() => toggleFollow.mutate(user.username)}
          disabled={toggleFollow.isPending}
          className="px-4 h-9 rounded-full bg-foreground text-background font-semibold text-sm flex items-center gap-1.5 hover:bg-accent hover:text-accent-foreground transition-colors duration-200 disabled:opacity-60 whitespace-nowrap"
        >
          {!user.isFollowing && user.followStatus !== "PENDING" && (
            <UserPlus size={14} strokeWidth={2} />
          )}
          {user.isFollowing && <Check size={14} strokeWidth={2} />}
          {followLabel}
        </button>
      )}
    </div>
  );
}

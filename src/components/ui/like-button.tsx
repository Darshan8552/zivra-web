import { Heart } from "lucide-react";
import { cn } from "#/lib/utils.ts";
import { useToggleCommentLike, useTogglePostLike } from "#/lib/likes/likes.hooks.ts";

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));

export type LikeButtonType = "post" | "comment";

export interface LikeButtonProps {
  id: string;
  type: LikeButtonType;
  liked: boolean;
  count: number;
  size?: number;
  showCount?: boolean;
  className?: string;
  iconClassName?: string;
  countClassName?: string;
  disabled?: boolean;
  testId?: string;
}

export function LikeButton({
  id,
  type,
  liked,
  count,
  size = 20,
  showCount = true,
  className,
  iconClassName,
  countClassName,
  disabled,
  testId,
}: LikeButtonProps) {
  const postToggle = useTogglePostLike(type === "post" ? id : "");
  const commentToggle = useToggleCommentLike(type === "comment" ? id : "");
  const toggle = type === "post" ? postToggle : commentToggle;
  const isPending = toggle.isPending;

  const handleClick = () => {
    if (disabled || isPending) return;
    // pass previous liked to mutation (it inverts)
    (toggle.mutate as (v: boolean) => void)(liked);
  };

  return (
    <button
      type="button"
      data-testid={testId}
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
      onClick={handleClick}
      disabled={disabled || isPending}
      className={cn(
        "flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-accent disabled:opacity-60",
        liked && "text-accent",
        className,
      )}
    >
      <Heart
        size={size}
        strokeWidth={1.75}
        aria-hidden="true"
        className={cn(liked ? "fill-accent text-accent" : "", iconClassName)}
      />
      {showCount && <span className={cn("tabular-nums", countClassName)}>{fmt(count)}</span>}
    </button>
  );
}

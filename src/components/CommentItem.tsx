import { Heart } from "lucide-react";
import { useState } from "react";
import type { Comment } from "#/lib/comments/comments.types.ts";
import { useToggleCommentLike } from "#/lib/likes/likes.hooks.ts";
import { timeAgo } from "#/lib/utils.ts";

const fmt = (n: number) =>
	n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : n;

export function CommentItem({
	comment,
	onReply,
}: {
	comment: Comment;
	onReply?: (comment: Comment) => void;
}) {
	const [liked, setLiked] = useState(false);
	const [likes, setLikes] = useState(comment._count.likes);
	const toggleLike = useToggleCommentLike(comment.id);

	const handleLike = () => {
		const next = !liked;
		setLiked(next);
		setLikes((n) => (next ? n + 1 : n - 1));
		toggleLike.mutate(liked);
	};

	return (
		<div
			className="flex items-start gap-3 py-3"
			data-testid={`comment-${comment.id}`}
		>
			{comment.user.avatarUrl ? (
				<img
					src={comment.user.avatarUrl}
					alt=""
					className="h-8 w-8 rounded-full object-cover mt-0.5"
				/>
			) : (
				<div className="h-8 w-8 rounded-full bg-secondary mt-0.5" />
			)}

			<div className="flex-1 min-w-0">
				<p className="text-[14px] leading-relaxed">
					<span className="font-display font-semibold tracking-tight mr-2">
						{comment.user.username}
					</span>
					<span>{comment.content}</span>
				</p>
				<div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
					<span>{timeAgo(comment.createdAt)}</span>
					{likes > 0 && <span>{fmt(likes)} likes</span>}
					{onReply && (
						<button
							type="button"
							data-testid={`comment-reply-${comment.id}`}
							onClick={() => onReply(comment)}
							className="font-semibold hover:text-foreground transition-colors duration-200"
						>
							Reply
						</button>
					)}
				</div>
			</div>

			<button
				type="button"
				data-testid={`comment-like-${comment.id}`}
				onClick={handleLike}
				aria-label="Like comment"
				className="mt-1 text-muted-foreground hover:text-foreground transition-colors duration-200"
			>
				<Heart
					size={14}
					strokeWidth={1.75}
					className={liked ? "fill-accent text-accent" : ""}
				/>
			</button>
		</div>
	);
}

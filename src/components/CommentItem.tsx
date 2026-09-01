import { Avatar } from "#/components/ui/avatar.tsx";
import { LikeButton } from "#/components/ui/like-button.tsx";
import type { Comment } from "#/lib/comments/comments.types.ts";
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
	const liked = Boolean(comment.liked);
	const likes = comment._count.likes;

	return (
		<div
			className="flex items-start gap-3 py-3"
			data-testid={`comment-${comment.id}`}
		>
			<Avatar
				src={comment.user.avatarUrl}
				name={comment.user.name}
				username={comment.user.username}
				size="sm"
				shape="circle"
				className="mt-0.5"
			/>

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

			<LikeButton
				id={comment.id}
				type="comment"
				liked={liked}
				count={likes}
				size={14}
				showCount={false}
				testId={`comment-like-${comment.id}`}
				className="mt-1 text-muted-foreground hover:text-foreground"
			/>
		</div>
	);
}

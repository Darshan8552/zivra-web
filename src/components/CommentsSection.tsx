import { Loader2 } from "lucide-react";
import { useState } from "react";
import { CommentInput } from "#/components/CommentInput.tsx";
import { CommentItem } from "#/components/CommentItem.tsx";
import {
	useComments,
	useCreateComment,
} from "#/lib/comments/comments.hooks.ts";
import type { Comment } from "#/lib/comments/comments.types.ts";

export function CommentsSection({ postId }: { postId: string }) {
	const commentsQuery = useComments(postId);
	const createComment = useCreateComment(postId);
	const [replyTo, setReplyTo] = useState<Comment | null>(null);

	const items = commentsQuery.data?.pages.flatMap((page) => page.items) ?? [];

	const handleSubmit = (content: string, parentId?: string) => {
		createComment.mutate(
			{ content, parentId },
			{
				onSuccess: () => setReplyTo(null),
			},
		);
	};

	return (
		<section className="border-t border-border">
			<div className="px-4 py-2">
				<p className="overline text-muted-foreground">
					{commentsQuery.data?.pages[0]?.items.length
						? `${commentsQuery.data.pages[0].items.length} comments`
						: "Comments"}
				</p>
			</div>

			<div className="max-h-[400px] overflow-y-auto px-4">
				{commentsQuery.isLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 size={20} className="animate-spin text-muted-foreground" />
					</div>
				) : items.length === 0 ? (
					<p className="text-center text-sm text-muted-foreground py-8">
						No comments yet. Be the first to comment.
					</p>
				) : (
					items.map((comment) => (
						<CommentItem
							key={comment.id}
							comment={comment}
							onReply={(c) => setReplyTo(c)}
						/>
					))
				)}

				{commentsQuery.hasNextPage && (
					<div className="flex justify-center py-3">
						<button
							type="button"
							data-testid="comments-load-more"
							onClick={() => commentsQuery.fetchNextPage()}
							disabled={commentsQuery.isFetchingNextPage}
							className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-40"
						>
							{commentsQuery.isFetchingNextPage
								? "Loading…"
								: "Load more comments"}
						</button>
					</div>
				)}
			</div>

			{replyTo && (
				<div className="px-4 py-2 border-t border-border">
					<p className="text-xs text-muted-foreground">
						Replying to{" "}
						<span className="font-semibold text-foreground">
							{replyTo.user.username}
						</span>
						<button
							type="button"
							onClick={() => setReplyTo(null)}
							className="ml-2 text-accent hover:underline"
						>
							Cancel
						</button>
					</p>
				</div>
			)}

			<CommentInput
				onSubmit={(content) => handleSubmit(content, replyTo?.id)}
				placeholder={
					replyTo ? `Reply to ${replyTo.user.username}…` : "Add a comment…"
				}
			/>
		</section>
	);
}

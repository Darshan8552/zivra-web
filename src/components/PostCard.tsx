import { Link } from "@tanstack/react-router";
import {
	Bookmark,
	BookmarkPlus,
	Copy,
	Flag,
	MapPin,
	MessageCircle,
	MoreHorizontal,
	Share2,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { RichText } from "#/components/RichText.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import { LikeButton } from "#/components/ui/like-button.tsx";
import { useToggleBookmark } from "#/lib/bookmarks/bookmarks.hooks.ts";
import { useBookmarkedState } from "#/lib/interactions/interactions.hooks.ts";
import { useDeletePost } from "#/lib/posts/posts.hooks.ts";
import type { Post } from "#/lib/posts/posts.types.ts";
import { Avatar } from "#/components/ui/avatar.tsx";
import { timeAgo } from "#/lib/utils.ts";

const fmt = (n: number) =>
	n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : n;

function cloudinarySrcSet(
	url: string,
	widths: number[] = [320, 640, 768, 1024, 1280],
): string | undefined {
	if (!url.includes("/upload/")) return undefined;
	const hasAuto = url.includes("f_auto");
	if (hasAuto) {
		return widths
			.map((w) => {
				if (url.includes("w_")) {
					const replaced = url.replace(/w_\d+/, `w_${w}`);
					if (replaced !== url) return `${replaced} ${w}w`;
				}
				if (url.includes("f_auto,q_auto")) {
					return `${url.replace("f_auto,q_auto", `f_auto,q_auto,w_${w}`)} ${w}w`;
				}
				if (url.includes("f_auto")) {
					return `${url.replace("f_auto", `f_auto,q_auto,w_${w}`)} ${w}w`;
				}
				return `${url.replace("/upload/", `/upload/w_${w}/`)} ${w}w`;
			})
			.join(", ");
	}
	return widths
		.map((w) => `${url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`)} ${w}w`)
		.join(", ");
}

function cloudinaryPoster(url: string): string {
	let poster = url.replace(/\.mp4(\?.*)?$/i, ".jpg");
	if (!poster.includes("/upload/")) return poster;
	if (poster.includes("f_auto")) {
		let result = poster;
		if (!result.includes("w_640")) {
			if (result.includes("f_auto,q_auto")) {
				result = result.replace("f_auto,q_auto", "f_auto,q_auto,w_640");
			} else {
				result = result.replace("f_auto", "f_auto,q_auto,w_640");
			}
		}
		if (!result.includes("so_0")) {
			if (result.includes("w_640")) {
				result = result.replace("w_640", "w_640,so_0");
			} else {
				result = result.replace("/upload/", "/upload/so_0/");
			}
		}
		result = result.replace(/f_auto,?f_auto/g, "f_auto");
		result = result.replace(/q_auto,?q_auto/g, "q_auto");
		return result;
	}
	return poster.replace("/upload/", "/upload/f_auto,q_auto,w_640,so_0/");
}

export const PostCard = ({
	post,
	currentUserId,
	priority,
}: {
	post: Post;
	currentUserId?: string;
	priority?: boolean;
}) => {
	const [bookmarked, setBookmarked] = useBookmarkedState(
		post.id,
		post.bookmarked,
	);

	const isOwner = currentUserId === post.userId;

	const toggleBookmarkMutation = useToggleBookmark(post.id);
	const deletePostMutation = useDeletePost();

	const handleBookmark = () => {
		const next = !bookmarked;
		setBookmarked(next);
		toggleBookmarkMutation.mutate(bookmarked, {
			onError: () => setBookmarked(!next),
		});
		toast(next ? "Saved to your collection" : "Removed from saved");
	};

	const cover = post.media[0];

	return (
		<article className="w-full" data-testid={`post-${post.id}`}>
			{}
			<header className="flex items-center gap-3 mb-4 px-1">
				<Avatar
					src={post.user.avatarUrl}
					name={post.user.name}
					username={post.user.username}
					size="md"
					shape="square"
				/>
				<div className="flex-1 min-w-0">
					<div className="flex items-baseline gap-2">
						<p className="font-display font-semibold tracking-tight truncate">
							{post.user.name}
						</p>
						<span className="text-muted-foreground text-xs" aria-hidden="true">·</span>
						<span className="text-xs text-muted-foreground overline">
							{timeAgo(post.createdAt)}
						</span>
					</div>
					<p className="text-xs text-muted-foreground truncate flex items-center gap-1">
						@{post.user.username}
						{post.locationName && (
							<>
								{" · "}
								<MapPin size={10} strokeWidth={2} aria-hidden="true" className="inline" />
								{post.locationName}
							</>
						)}
					</p>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							data-testid={`post-menu-${post.id}`}
							aria-label="Post options"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
							}}
							className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
						>
							<MoreHorizontal size={18} strokeWidth={1.75} aria-hidden="true" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						{isOwner && (
							<>
								<DropdownMenuItem
									data-testid={`post-delete-${post.id}`}
									onClick={() => {
										if (
											window.confirm(
												"Delete this post? This cannot be undone.",
											)
										) {
											deletePostMutation.mutate(post.id);
										}
									}}
									className="text-destructive focus:text-destructive"
								>
									<Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
									Delete
								</DropdownMenuItem>
								<DropdownMenuSeparator />
							</>
						)}
						<DropdownMenuItem
							data-testid={`post-copy-link-${post.id}`}
							onClick={() => toast("Copy link — coming soon")}
						>
							<Copy className="mr-2 h-4 w-4" aria-hidden="true" />
							Copy link
						</DropdownMenuItem>
						<DropdownMenuItem
							data-testid={`post-report-${post.id}`}
							onClick={() => toast("Report — coming soon")}
						>
							<Flag className="mr-2 h-4 w-4" aria-hidden="true" />
							Report
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</header>

			<Link to="/posts/$postId" params={{ postId: post.id }} className="block" aria-label={`View post by @${post.user.username}`}>
				{}
				<div className="overflow-hidden rounded-2xl border border-border bg-secondary">
					{cover ? (
						cover.type === "VIDEO" ? (
							<video
								src={cover.url}
								className="w-full aspect-[4/5] object-cover"
								muted
								playsInline
								poster={cloudinaryPoster(cover.url)}
								preload="metadata"
								width={cover.width ?? 1024}
								height={cover.height ?? 1280}
							/>
						) : (
							<img
								src={cover.url}
								alt={post.caption?.trim() ? post.caption.trim() : `Photo by @${post.user.username}`}
								className="w-full aspect-[4/5] object-cover"
								loading={priority ? "eager" : "lazy"}
								decoding="async"
								fetchPriority={priority ? "high" : "auto"}
								width={cover.width ?? 1024}
								height={cover.height ?? 1280}
								srcSet={cloudinarySrcSet(cover.url)}
								sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 640px"
							/>
						)
					) : (
						<div className="w-full aspect-[4/5] bg-secondary" />
					)}
				</div>
			</Link>

			{}
			<div className="flex items-center justify-between mt-4 px-1">
				<div className="flex items-center gap-5">
					<LikeButton
						id={post.id}
						type="post"
						liked={post.liked}
						count={post._count.likes}
						size={20}
						testId={`post-like-${post.id}`}
					/>
					<Link
						to="/posts/$postId"
						params={{ postId: post.id }}
						data-testid={`post-comment-${post.id}`}
						aria-label={`View comments for post by @${post.user.username}`}
						className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
					>
						<MessageCircle size={20} strokeWidth={1.75} aria-hidden="true" />
						<span className="tabular-nums">{fmt(post._count.comments)}</span>
					</Link>
					<button
						type="button"
						data-testid={`post-share-${post.id}`}
						aria-label="Share post"
						onClick={() => toast("Share — coming soon")}
						className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
					>
						<Share2 size={20} strokeWidth={1.75} aria-hidden="true" />
						<span className="tabular-nums">Share</span>
					</button>
				</div>
				<button
					type="button"
					data-testid={`post-bookmark-${post.id}`}
					aria-label={bookmarked ? "Remove bookmark" : "Save bookmark"}
					aria-pressed={bookmarked}
					onClick={handleBookmark}
					className="text-foreground/80 hover:text-foreground transition-colors duration-200"
				>
					{bookmarked ? (
						<Bookmark
							size={20}
							strokeWidth={1.75}
							aria-hidden="true"
							className="fill-foreground text-foreground"
						/>
					) : (
						<BookmarkPlus size={20} strokeWidth={1.75} aria-hidden="true" />
					)}
				</button>
			</div>

			{}
			<div className="mt-3 px-1">
				<p className="text-[15px] leading-relaxed">
					<span className="font-display font-semibold tracking-tight mr-2">
						@{post.user.username}
					</span>
					{post.caption && <RichText text={post.caption} />}
				</p>
				{post.hashtags.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-1">
						{post.hashtags.map((h) => (
							<span
								key={h.hashtag.id}
								className="text-xs text-accent font-medium"
							>
								#{h.hashtag.name}
							</span>
						))}
					</div>
				)}
				<Link
					to="/posts/$postId"
					params={{ postId: post.id }}
					data-testid={`post-view-comments-${post.id}`}
					className="mt-2 block text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
				>
					View all {fmt(post._count.comments)} comments
				</Link>
			</div>
		</article>
	);
};

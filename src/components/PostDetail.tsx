import { Link } from "@tanstack/react-router";
import {
	Bookmark,
	Copy,
	Flag,
	Heart,
	MapPin,
	MessageCircle,
	MoreHorizontal,
	Share2,
	Tag,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CommentsSection } from "#/components/CommentsSection.tsx";
import { RichText } from "#/components/RichText.tsx";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import { useToggleBookmark } from "#/lib/bookmarks/bookmarks.hooks.ts";
import {
	useBookmarkedState,
	useLikedState,
} from "#/lib/interactions/interactions.hooks.ts";
import { useTogglePostLike } from "#/lib/likes/likes.hooks.ts";
import { useDeletePost } from "#/lib/posts/posts.hooks.ts";
import type { Post } from "#/lib/posts/posts.types.ts";
import { timeAgo } from "#/lib/utils.ts";

function cloudinarySrcSet(
	url: string,
	widths: number[] = [320, 640, 1024],
): string | undefined {
	if (!url.includes("/upload/")) return undefined;
	return widths
		.map((w) => `${url.replace("/upload/", `/upload/f_auto,q_auto,w_${w}/`)} ${w}w`)
		.join(", ");
}

const fmt = (n: number) =>
	n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : n;

export function PostDetail({
	post,
	currentUserId,
}: {
	post: Post;
	currentUserId?: string;
}) {
	const [liked, setLiked] = useLikedState(post.id, post.liked);
	const [likes, setLikes] = useState(post._count.likes);
	const [bookmarked, setBookmarked] = useBookmarkedState(
		post.id,
		post.bookmarked,
	);
	const [activeMedia, setActiveMedia] = useState(0);

	const isOwner = currentUserId === post.userId;

	const toggleLike = useTogglePostLike(post.id);
	const toggleBookmark = useToggleBookmark(post.id);
	const deletePostMutation = useDeletePost();

	useEffect(() => {
		setLikes(post._count.likes);
	}, [post._count.likes]);

	const handleLike = () => {
		const next = !liked;
		setLiked(next);
		setLikes((n) => (next ? n + 1 : n - 1));
		toggleLike.mutate(liked);
	};

	const handleBookmark = () => {
		const next = !bookmarked;
		setBookmarked(next);
		toggleBookmark.mutate(bookmarked);
	};

	const media = post.media;

	return (
		<div className="max-w-2xl mx-auto">
			{}
			<header className="flex items-center gap-3 px-4 py-3 border-b border-border">
				{post.user.avatarUrl ? (
					<img
						src={post.user.avatarUrl}
						alt=""
						className="h-10 w-10 rounded-full object-cover"
					/>
				) : (
					<div className="h-10 w-10 rounded-full bg-secondary" />
				)}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-1.5">
						<Link
							to="/users/$username"
							params={{ username: post.user.username }}
							className="font-display font-semibold tracking-tight hover:underline"
						>
							{post.user.username}
						</Link>
						{post.user.isVerified && (
							<span className="h-4 w-4 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-[10px]">
								✓
							</span>
						)}
					</div>
					{post.locationName && (
						<p className="text-xs text-muted-foreground truncate flex items-center gap-1">
							<MapPin size={10} strokeWidth={2} />
							{post.locationName}
						</p>
					)}
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							data-testid={`post-menu-${post.id}`}
							aria-label="Post options"
							className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
						>
							<MoreHorizontal size={18} strokeWidth={1.75} />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						{isOwner && (
							<>
								<DropdownMenuItem
									data-testid={`post-delete-${post.id}`}
									onClick={() => {
										if (
											window.confirm("Delete this post? This cannot be undone.")
										) {
											deletePostMutation.mutate(post.id);
										}
									}}
									className="text-destructive focus:text-destructive"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</DropdownMenuItem>
								<DropdownMenuSeparator />
							</>
						)}
						<DropdownMenuItem
							data-testid={`post-copy-link-${post.id}`}
							onClick={() => toast("Copy link — coming soon")}
						>
							<Copy className="mr-2 h-4 w-4" />
							Copy link
						</DropdownMenuItem>
						<DropdownMenuItem
							data-testid={`post-report-${post.id}`}
							onClick={() => toast("Report — coming soon")}
						>
							<Flag className="mr-2 h-4 w-4" />
							Report
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</header>

			{}
			<div className="relative bg-secondary">
				{media[activeMedia]?.type === "VIDEO" ? (
					<PostVideo url={media[activeMedia].url} caption={post.caption} />
				) : (
					<img
						src={media[activeMedia]?.url}
						alt={post.caption ?? ""}
						className="w-full max-h-[600px] object-contain"
						width={media[activeMedia]?.width ?? undefined}
						height={media[activeMedia]?.height ?? undefined}
						decoding="async"
						loading="eager"
						fetchPriority="high"
						srcSet={
							media[activeMedia]?.url
								? cloudinarySrcSet(media[activeMedia].url)
								: undefined
						}
						sizes="(max-width: 640px) 100vw, 672px"
					/>
				)}

				{media.length > 1 && (
					<>
						<button
							type="button"
							data-testid="post-media-prev"
							onClick={() =>
								setActiveMedia((i) => (i > 0 ? i - 1 : media.length - 1))
							}
							disabled={activeMedia === 0}
							className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-background transition-colors disabled:opacity-30"
							aria-label="Previous media"
						>
							‹
						</button>
						<button
							type="button"
							data-testid="post-media-next"
							onClick={() =>
								setActiveMedia((i) => (i < media.length - 1 ? i + 1 : 0))
							}
							disabled={activeMedia === media.length - 1}
							className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-foreground hover:bg-background transition-colors disabled:opacity-30"
							aria-label="Next media"
						>
							›
						</button>
						<div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
							{media.map((m, i) => (
								<span
									key={m.id}
									className={`h-1.5 w-1.5 rounded-full transition-colors ${
										i === activeMedia ? "bg-foreground" : "bg-foreground/40"
									}`}
								/>
							))}
						</div>
					</>
				)}
			</div>

			{}
			<div className="flex items-center justify-between px-4 py-3">
				<div className="flex items-center gap-5">
					<button
						type="button"
						data-testid="post-like"
						onClick={handleLike}
						className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-accent"
					>
						<Heart
							size={22}
							strokeWidth={1.75}
							className={liked ? "fill-accent text-accent" : ""}
						/>
						<span className="tabular-nums">{fmt(likes)}</span>
					</button>
					<Link
						to="/posts/$postId"
						params={{ postId: post.id }}
						className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
					>
						<MessageCircle size={22} strokeWidth={1.75} />
						<span className="tabular-nums">{fmt(post._count.comments)}</span>
					</Link>
					<button
						type="button"
						data-testid="post-share"
						className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
					>
						<Share2 size={22} strokeWidth={1.75} />
						<span className="tabular-nums">Share</span>
					</button>
				</div>
				<button
					type="button"
					data-testid="post-bookmark"
					onClick={handleBookmark}
					className="text-foreground/80 hover:text-foreground transition-colors duration-200"
				>
					<Bookmark
						size={22}
						strokeWidth={1.75}
						className={bookmarked ? "fill-foreground text-foreground" : ""}
					/>
				</button>
			</div>

			{}
			<div className="px-4 pb-3">
				{post.caption && (
					<p className="text-[15px] leading-relaxed">
						<Link
							to="/users/$username"
							params={{ username: post.user.username }}
							className="font-display font-semibold tracking-tight mr-2 hover:underline"
						>
							{post.user.username}
						</Link>
						<RichText text={post.caption} />
					</p>
				)}

				{}
				{post.hashtags.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-2">
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

				{}
				{post.userTags.length > 0 && (
					<div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
						<Tag size={12} strokeWidth={1.75} />
						{post.userTags.map((t) => (
							<Link
								key={t.id}
								to="/users/$username"
								params={{ username: t.user.username }}
								className="hover:text-accent hover:underline"
							>
								{t.user.username}
							</Link>
						))}
					</div>
				)}

				<p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">
					{timeAgo(post.createdAt)}
				</p>
			</div>

			{}
			<CommentsSection postId={post.id} />
		</div>
	);
}

function PostVideo({ url, caption }: { url: string; caption: string | null }) {
	return (
		<>
			{}
			<video
				src={url}
				className="w-full max-h-[600px] object-contain"
				controls
				playsInline
				poster={url.replace(".mp4", ".jpg")}
				preload="metadata"
				aria-label={caption ?? "Video post"}
			/>
		</>
	);
}

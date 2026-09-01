import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "#/components/ui/avatar.tsx";
import { PostCard } from "#/components/PostCard.tsx";
import { StoryBar } from "#/components/story/StoryBar.tsx";
import { StoryViewer } from "#/components/story/StoryViewer.tsx";
import { useStoriesFeed } from "#/lib/stories/stories.hooks.ts";
import { useDiscoveryFeed, useFollowingFeed } from "#/lib/feed/feed.hooks.ts";
import { currentUser } from "#/lib/mock.ts";
import { currentUserQueryOptions } from "#/lib/query.options.ts";
import { useSuggestions, useToggleFollow } from "#/lib/users/users.hooks.ts";
import type { SuggestionUser } from "#/lib/users/users.types.ts";

const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://zivra.app";

export const Route = createFileRoute("/_main/feed/")({
	component: FeedPage,
	head: () => ({
		meta: [
			{
				title: "Feed — Zivra",
			},
			{
				name: "description",
				content: "Your personalized feed on Zivra — follow creators and discover new moments.",
			},
			{
				property: "og:title",
				content: "Feed — Zivra",
			},
			{
				property: "og:description",
				content: "Your personalized feed on Zivra — follow creators and discover new moments.",
			},
			{
				property: "og:url",
				content: `${SITE_URL}/feed`,
			},
			{
				property: "og:type",
				content: "website",
			},
		],
		links: [
			{
				rel: "canonical",
				href: `${SITE_URL}/feed`,
			},
		],
	}),
});

type FeedTab = "following" | "discovery";

const slug = (label: string) => label.toLowerCase().replace(/\s+/g, "-");

function FeedPage() {
	const [tab, setTab] = useState<FeedTab>("following");
	const suggestionsQuery = useSuggestions();
	const toggleFollow = useToggleFollow();
	const { data: me } = useQuery(currentUserQueryOptions);
	const storiesFeed = useStoriesFeed(20);
	const storyGroups = storiesFeed.data?.pages.flatMap((p) => p.groups) ?? [];
	const [activeStoryGroup, setActiveStoryGroup] = useState<number | null>(null);
	const [followState, setFollowState] = useState<
		Record<string, "following" | "requested" | "idle">
	>({});

	const followingQuery = useFollowingFeed(12);
	const discoveryQuery = useDiscoveryFeed(12);

	const activeQuery = tab === "following" ? followingQuery : discoveryQuery;
	const posts = activeQuery.data?.pages.flatMap((p) => p.items) ?? [];
	const hasNextPage = activeQuery.hasNextPage;
	const isFetchingNextPage = activeQuery.isFetchingNextPage;

	const sentinelRef = useRef<HTMLDivElement | null>(null);

	const fetchNextPage = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) {
			void activeQuery.fetchNextPage();
		}
	}, [hasNextPage, isFetchingNextPage, activeQuery.fetchNextPage]);

	useEffect(() => {
		if (typeof IntersectionObserver === "undefined") return;
		const el = sentinelRef.current;
		if (!el || !hasNextPage || isFetchingNextPage) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					fetchNextPage();
				}
			},
			{ threshold: 0, rootMargin: "100px" },
		);
		observer.observe(el);
		return () => {
			observer.disconnect();
		};
	}, [fetchNextPage, hasNextPage, isFetchingNextPage, tab]);

	const suggestions = suggestionsQuery.data ?? [];

	const handleFollow = (s: SuggestionUser) => {
		toggleFollow.mutate(s.username, {
			onSuccess: (data) => {
				setFollowState((prev) => ({
					...prev,
					[s.id]:
						data.followStatus === "PENDING"
							? "requested"
							: data.isFollowing
								? "following"
								: "idle",
				}));
			},
		});
	};

	const avatarUrl = (s: SuggestionUser) => s.avatarUrl ?? currentUser.avatar;
	const followLabel = (s: SuggestionUser) =>
		followState[s.id] === "requested"
			? "Requested"
			: followState[s.id] === "following"
				? "Following"
				: "Follow";

	return (
		<div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
			<div className="max-w-[1200px] mx-auto grid grid-cols-12 gap-8 lg:gap-12">
				{}
				<div className="col-span-12 lg:col-span-8 space-y-12">
					{}
					<header className="flex items-end justify-between border-b border-border pb-6">
						<div>
							<p className="overline text-accent">
								Today · {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date())}
							</p>
							<h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2">
								Your feed
							</h1>
						</div>
						<div role="tablist" aria-label="Feed filters" aria-orientation="horizontal" className="flex gap-2 text-xs">
							<FilterChip
								label="Following"
								active={tab === "following"}
								onClick={() => setTab("following")}
							/>
							<FilterChip
								label="For you"
								active={tab === "discovery"}
								onClick={() => setTab("discovery")}
							/>
							<FilterChip label="Editorial" disabled />
						</div>
					</header>

					{}
					<section>
						<div className="flex items-center justify-between mb-4">
							<p className="overline text-muted-foreground">Stories</p>
							<button
								type="button"
								data-testid="stories-see-all"
								className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
							>
								See all
							</button>
						</div>
						<StoryBar
							externalControl
							onSelectGroup={(_g, idx) => setActiveStoryGroup(idx)}
						/>
						{activeStoryGroup !== null && storyGroups[activeStoryGroup] && (
							<StoryViewer
								open={activeStoryGroup !== null}
								groups={storyGroups}
								initialGroupIndex={activeStoryGroup}
								onClose={() => setActiveStoryGroup(null)}
								currentUserId={me?.id}
							/>
						)}
					</section>

					{}
					<section
						role="tabpanel"
						id={`feed-panel-${slug(tab === "following" ? "Following" : "For you")}`}
						aria-labelledby={`tab-${slug(tab === "following" ? "Following" : "For you")}`}
						className="space-y-14"
					>
						{activeQuery.isLoading ? (
							<div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
								<Loader2 className="animate-spin" size={24} />
								<p className="text-sm">Loading posts…</p>
							</div>
						) : activeQuery.isError ? (
							<div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
								<p className="text-sm font-medium text-destructive">
									Failed to load feed
								</p>
								<button
									type="button"
									onClick={() => void activeQuery.refetch()}
									className="mt-3 text-xs font-semibold px-4 h-8 rounded-full bg-foreground text-background"
								>
									Retry
								</button>
							</div>
						) : posts.length === 0 ? (
							<div className="rounded-2xl border border-border p-8 text-center">
								<p className="font-display font-semibold tracking-tight text-lg">
									{tab === "following"
										? "No posts yet"
										: "Nothing to discover yet"}
								</p>
								<p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
									{tab === "following"
										? "Follow people to see their posts here. Or check For you for discovery."
										: "When people you follow start following public creators, their posts will appear here. For now, explore trending public posts."}
								</p>
								{tab === "following" && (
									<button
										type="button"
										onClick={() => setTab("discovery")}
										className="mt-4 text-xs font-semibold px-4 h-9 rounded-full bg-accent text-accent-foreground"
									>
										Explore For you
									</button>
								)}
							</div>
						) : (
							posts.map((p, idx) => (
								<PostCard
									key={p.id}
									post={p}
									currentUserId={me?.id}
									priority={idx === 0 && !activeQuery.isFetchingNextPage}
								/>
							))
						)}

						{}
						{hasNextPage && <div ref={sentinelRef} className="h-1" />}

						{isFetchingNextPage && (
							<div className="flex justify-center py-4">
								<Loader2
									className="animate-spin text-muted-foreground"
									size={20}
								/>
							</div>
						)}

						{!hasNextPage && posts.length > 0 && (
							<p className="text-center text-xs text-muted-foreground overline py-4">
								You’re all caught up
							</p>
						)}

						{}
						{hasNextPage && !isFetchingNextPage && (
							<div className="flex justify-center">
								<button
									type="button"
									onClick={() => void activeQuery.fetchNextPage()}
									className="text-xs font-semibold px-4 h-8 rounded-full border border-border hover:bg-secondary transition-colors"
								>
									Load more
								</button>
							</div>
						)}
					</section>

					{}
					{tab === "following" && suggestions.length > 0 && (
						<section>
							<div className="flex items-center gap-4 my-8">
								<div className="h-px flex-1 bg-border" />
								<p className="overline text-muted-foreground">
									Suggested for you
								</p>
								<div className="h-px flex-1 bg-border" />
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								{suggestions.map((s) => (
									<SuggestionCard
										key={s.id}
										suggestion={s}
										onFollow={handleFollow}
										avatarUrl={avatarUrl}
										followLabel={followLabel}
									/>
								))}
							</div>
						</section>
					)}
				</div>
				{}
				<aside className="hidden lg:block col-span-4 space-y-8 sticky top-8 self-start">
					<div className="rounded-2xl border border-border p-6">
						<div className="flex items-center gap-3">
							<Avatar
								src={me?.avatarUrl ?? currentUser.avatar}
								name={me?.name ?? currentUser.name}
								username={me?.username ?? currentUser.username}
								size="md"
								shape="square"
								className="h-12 w-12 rounded-xl text-sm"
							/>
							<div className="flex-1 min-w-0">
								<p className="font-display font-semibold tracking-tight">
									{me?.name ?? currentUser.name}
								</p>
								<p className="text-xs text-muted-foreground">
									@{me?.username ?? currentUser.username}
								</p>
							</div>
						</div>
						<div className="grid grid-cols-3 gap-2 mt-5 text-center">
							<Stat n={me?.postCount ?? currentUser.posts} label="Posts" />
							<Stat
								n={(me?.followerCount ?? currentUser.followers).toString()}
								label="Followers"
							/>
							<Stat
								n={(me?.followingCount ?? currentUser.following).toString()}
								label="Following"
							/>
						</div>
					</div>
					<div>
						<p className={`overline mb-4 ${suggestions.length === 0 && !suggestionsQuery.isLoading ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>Who to follow</p>
						{suggestionsQuery.isLoading ? (
							<div className="space-y-4">
								{[1,2,3].map((i) => (
									<div key={i} className="flex items-center gap-3 animate-pulse">
										<div className="h-10 w-10 rounded-lg bg-secondary" />
										<div className="flex-1 space-y-2">
											<div className="h-3 w-24 bg-secondary rounded" />
											<div className="h-2 w-16 bg-secondary rounded" />
										</div>
									</div>
								))}
							</div>
						) : suggestions.length === 0 ? (
							<p className="text-sm text-muted-foreground">No suggestions right now — try searching for people to follow</p>
						) : (
							<div className="space-y-4">
								{suggestions.map((s) => (
									<div key={s.id} className="flex items-center gap-3">
										<Link
											to="/users/$username"
											params={{ username: s.username }}
											className="flex items-center gap-3 flex-1 min-w-0"
										>
											<Avatar
												src={s.avatarUrl}
												name={s.name}
												username={s.username}
												size="md"
												shape="square"
												className="h-10 w-10 rounded-lg"
											/>
											<div className="flex-1 min-w-0">
												<p className="font-display font-semibold text-sm tracking-tight truncate">
													{s.name}
												</p>
												<p className="text-xs text-muted-foreground truncate">
													{s.reason}
												</p>
											</div>
										</Link>
										<button
											type="button"
											data-testid={`follow-${s.id}`}
											onClick={() => handleFollow(s)}
											className="text-xs font-semibold px-3 h-8 rounded-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
										>
											{followLabel(s)}
										</button>
									</div>
								))}
							</div>
						)}
					</div>
					<p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
						© 2026 Zivra · Privacy · Terms · Voice
					</p>
				</aside>
			</div>
		</div>
	);
}

const FilterChip = ({
	label,
	active,
	onClick,
	disabled,
}: {
	label: string;
	active?: boolean;
	onClick?: () => void;
	disabled?: boolean;
}) => {
	const id = `tab-${slug(label)}`;
	const controls = `feed-panel-${slug(label)}`;
	const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		const tabs = Array.from(
			document.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
		);
		const currentIndex = tabs.indexOf(e.currentTarget);
		let nextIndex: number | null = null;
		if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
		else if (e.key === "ArrowLeft")
			nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
		else if (e.key === "Home") nextIndex = 0;
		else if (e.key === "End") nextIndex = tabs.length - 1;
		if (nextIndex !== null) {
			e.preventDefault();
			const nextTab = tabs[nextIndex];
			nextTab?.focus();
			nextTab?.click();
		}
	};
	return (
		<button
			type="button"
			role="tab"
			id={id}
			aria-controls={controls}
			aria-selected={!!active}
			aria-disabled={disabled || undefined}
			tabIndex={disabled ? -1 : active ? 0 : -1}
			disabled={disabled}
			onClick={disabled ? undefined : onClick}
			onKeyDown={handleKeyDown}
			data-testid={`filter-${slug(label)}`}
			className={`px-3 h-8 rounded-full font-semibold transition-colors duration-200 text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
				active
					? "bg-foreground text-background"
					: disabled
						? "border border-border text-muted-foreground opacity-50 cursor-not-allowed"
						: "border border-border text-muted-foreground hover:text-foreground hover:border-foreground"
			}}`}
		>
			{label}
		</button>
	);
};

const Stat = ({ n, label }: { n: number | string; label: string }) => (
	<div>
		<p className="font-display font-bold text-lg tracking-tight">{n}</p>
		<p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
			{label}
		</p>
	</div>
);

const SuggestionCard = ({
	suggestion,
	onFollow,
	avatarUrl,
	followLabel,
}: {
	suggestion: SuggestionUser;
	onFollow: (s: SuggestionUser) => void;
	avatarUrl: (s: SuggestionUser) => string;
	followLabel: (s: SuggestionUser) => string;
}) => (
	<div className="rounded-2xl border border-border p-5 flex flex-col items-center text-center">
		<Link
			to="/users/$username"
			params={{ username: suggestion.username }}
			className="flex flex-col items-center"
		>
			<Avatar
				src={suggestion.avatarUrl}
				name={suggestion.name}
				username={suggestion.username}
				size="lg"
				shape="square"
			/>
			<p className="font-display font-semibold text-sm tracking-tight mt-3">
				{suggestion.name}
			</p>
			<p className="text-xs text-muted-foreground">@{suggestion.username}</p>
		</Link>
		<button
			type="button"
			data-testid={`suggest-follow-${suggestion.id}`}
			onClick={() => onFollow(suggestion)}
			className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-4 h-9 rounded-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
		>
			<UserPlus size={12} strokeWidth={2} /> {followLabel(suggestion)}
		</button>
	</div>
);

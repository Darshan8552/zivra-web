import { useCallback, useEffect, useRef } from "react";
import { FollowUserCard } from "#/components/FollowUserCard.tsx";
import { useUserFollowers, useUserFollowing } from "#/lib/users/users.hooks.ts";

interface FollowListProps {
	username: string;
	type: "followers" | "following";
	isOwnProfile: boolean;
}

export function FollowList({ username, type, isOwnProfile }: FollowListProps) {
	const isFollowersTab = type === "followers";
	const followersQuery = useUserFollowers(username);
	const followingQuery = useUserFollowing(username);
	const query = isFollowersTab ? followersQuery : followingQuery;

	const items = query.data?.pages.flatMap((page) => page.items) ?? [];
	const isEmpty = !query.isLoading && items.length === 0;
	const hasNextPage = query.hasNextPage;

	const loadMoreRef = useRef<HTMLDivElement>(null);

	const fetchNextPage = useCallback(() => {
		if (hasNextPage && !query.isFetchingNextPage) {
			query.fetchNextPage();
		}
	}, [hasNextPage, query.isFetchingNextPage, query]);

	useEffect(() => {
		const element = loadMoreRef.current;
		if (!element || !hasNextPage || query.isFetchingNextPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting) {
					fetchNextPage();
				}
			},
			{ threshold: 0, rootMargin: "100px" },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, [fetchNextPage, hasNextPage, query.isFetchingNextPage]);

	if (query.isLoading) {
		return (
			<div className="space-y-3">
				{["a", "b", "c", "d", "e"].map((key) => (
					<div
						key={key}
						className="h-16 bg-secondary animate-pulse rounded-xl"
					/>
				))}
			</div>
		);
	}

	if (isEmpty) {
		return (
			<div className="py-24 text-center border border-dashed border-border rounded-2xl">
				<p className="overline text-muted-foreground">
					{isFollowersTab ? "No followers yet" : "Not following anyone yet"}
				</p>
				<p className="font-display text-2xl tracking-tight mt-2">
					{isFollowersTab
						? "When someone follows you, they'll appear here."
						: "Follow people to see them here."}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{items.map((user) => (
				<FollowUserCard
					key={user.id}
					user={user}
					isOwnProfile={isOwnProfile}
					isFollowersTab={isFollowersTab}
				/>
			))}
			{hasNextPage && (
				<div ref={loadMoreRef} className="py-4 flex justify-center">
					{query.isFetchingNextPage ? (
						<div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
					) : (
						<button
							type="button"
							onClick={fetchNextPage}
							className="px-6 h-11 rounded-full border border-border font-semibold text-sm hover:border-foreground transition-colors duration-200"
						>
							Load more
						</button>
					)}
				</div>
			)}
		</div>
	);
}

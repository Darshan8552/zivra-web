import { useInfiniteQuery } from "@tanstack/react-query";
import { BackendApiError } from "#/lib/config/backend-client.ts";
import {
	getDiscoveryFeedFn,
	getFollowingFeedFn,
} from "#/lib/feed/feed.function.ts";

function isAuthError(error: unknown): boolean {
	return error instanceof BackendApiError && error.statusCode === 401;
}

export function useFollowingFeed(limit = 12) {
	return useInfiniteQuery({
		queryKey: ["feed", "following", limit] as const,
		queryFn: ({ pageParam }) =>
			getFollowingFeedFn({
				data: { cursor: pageParam as string | undefined, limit },
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		retry: (failureCount, error) => !isAuthError(error) && failureCount < 2,
		refetchOnWindowFocus: false,
		placeholderData: (prev) => prev,
	});
}

export function useDiscoveryFeed(limit = 12) {
	return useInfiniteQuery({
		queryKey: ["feed", "discovery", limit] as const,
		queryFn: ({ pageParam }) =>
			getDiscoveryFeedFn({
				data: { cursor: pageParam as string | undefined, limit },
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		retry: (failureCount, error) => !isAuthError(error) && failureCount < 2,
		refetchOnWindowFocus: false,
		placeholderData: (prev) => prev,
	});
}

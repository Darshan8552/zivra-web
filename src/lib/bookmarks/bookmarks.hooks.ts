import {
	infiniteQueryOptions,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "#/lib/auth/auth.hooks.ts";
import {
	getBookmarksFn,
	toggleBookmarkDeleteFn,
	toggleBookmarkFn,
} from "#/lib/bookmarks/bookmarks.function.ts";

export const bookmarksQueryOptions = infiniteQueryOptions({
	queryKey: ["bookmarks"] as const,
	queryFn: ({ pageParam }) =>
		getBookmarksFn({ data: { cursor: pageParam as string | undefined } }),
	initialPageParam: undefined as string | undefined,
	getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});

export function useBookmarks() {
	return useInfiniteQuery(bookmarksQueryOptions);
}

export function useToggleBookmark(postId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (bookmarked: boolean) =>
			bookmarked
				? toggleBookmarkDeleteFn({ data: { postId } })
				: toggleBookmarkFn({ data: { postId } }),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["posts", postId] });
			void queryClient.invalidateQueries({ queryKey: ["feed"] });
			void queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
		},
		onError: (error) =>
			toast.error(getErrorMessage(error, "Couldn't update bookmark.")),
	});
}

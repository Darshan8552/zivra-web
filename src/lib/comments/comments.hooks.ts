import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "#/lib/auth/auth.hooks.ts";
import {
	createCommentFn,
	getCommentRepliesFn,
	getCommentsFn,
} from "#/lib/comments/comments.function.ts";

export function useComments(postId: string) {
	return useInfiniteQuery({
		queryKey: ["posts", postId, "comments"] as const,
		queryFn: ({ pageParam }) =>
			getCommentsFn({ data: { postId, cursor: pageParam } }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: Boolean(postId),
	});
}

export function useCommentReplies(commentId: string) {
	return useInfiniteQuery({
		queryKey: ["comments", commentId, "replies"] as const,
		queryFn: ({ pageParam }) =>
			getCommentRepliesFn({ data: { commentId, cursor: pageParam } }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: Boolean(commentId),
	});
}

export function useCreateComment(postId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { content: string; parentId?: string }) =>
			createCommentFn({ data: { postId, ...input } }),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ["posts", postId, "comments"],
			});
			void queryClient.invalidateQueries({
				queryKey: ["posts", postId],
			});
		},
		onError: (error) =>
			toast.error(getErrorMessage(error, "Couldn't post comment.")),
	});
}

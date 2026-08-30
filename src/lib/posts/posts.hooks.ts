import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getErrorMessage } from "#/lib/auth/auth.hooks.ts";
import { currentUserQueryOptions } from "#/lib/query.options.ts";
import {
	createPostFn,
	deletePostFn,
	getPostFn,
	searchUsersFn,
	suggestHashtagsFn,
} from "#/lib/posts/posts.function.ts";
import { useDebouncedValue } from "#/lib/use-debounced-value.ts";

export function useCreatePost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (formData: FormData) => createPostFn({ data: formData }),
		onSuccess: (data) => {
			void queryClient.invalidateQueries({ queryKey: ["feed"] });
			void queryClient.invalidateQueries({ queryKey: ["posts"] });
			const username = (data as { user?: { username?: string } })?.user
				?.username;
			if (username) {
				void queryClient.invalidateQueries({ queryKey: ["users", username] });
			} else {
				const cached = queryClient.getQueryData(
					currentUserQueryOptions.queryKey,
				) as { username?: string } | null | undefined;
				if (cached?.username) {
					void queryClient.invalidateQueries({
						queryKey: ["users", cached.username],
					});
				}
			}
		},
	});
}

export function usePost(postId: string) {
	return useQuery({
		queryKey: ["posts", postId] as const,
		queryFn: () => getPostFn({ data: { postId } }),
		enabled: Boolean(postId),
	});
}

export function useDeletePost() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	return useMutation({
		mutationFn: (postId: string) => deletePostFn({ data: { postId } }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["feed"] });
			toast.success("Post deleted");
			navigate({ to: "/feed" });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Failed to delete post"));
		},
	});
}

export function useHashtagSuggestions(query: string) {
	const debounced = useDebouncedValue(query.trim(), 250);
	return useQuery({
		queryKey: ["hashtags", "suggestions", debounced] as const,
		queryFn: () => suggestHashtagsFn({ data: { q: debounced } }),
		staleTime: 30_000,
	});
}

export function useUserTagSuggestions(query: string) {
	const debounced = useDebouncedValue(query.trim(), 250);
	return useQuery({
		queryKey: ["users", "search", debounced] as const,
		queryFn: () => searchUsersFn({ data: { q: debounced } }),
		enabled: debounced.length > 0,
		staleTime: 30_000,
	});
}

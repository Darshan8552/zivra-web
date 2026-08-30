import {
	queryOptions,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { currentUserQueryOptions } from "#/lib/query.options.ts";
import {
	getSuggestionsFn,
	getUserFollowersFn,
	getUserFollowingFn,
	getUserPostsFn,
	getUserProfileFn,
	getUserTaggedPostsFn,
	toggleFollowFn,
	updatePrivacyFn,
	updateProfileFn,
} from "#/lib/users/users.function.ts";
import { getErrorMessage } from "../auth/auth.hooks";

export const userSuggestionsQueryOptions = queryOptions({
	queryKey: ["users", "suggestions"] as const,
	queryFn: () => getSuggestionsFn(),
});

export function useSuggestions() {
	return useQuery(userSuggestionsQueryOptions);
}

export const userProfileQueryOptions = (username: string) =>
	queryOptions({
		queryKey: ["users", username, "profile"] as const,
		queryFn: () => getUserProfileFn({ data: { username } }),
		enabled: Boolean(username),
	});

export type ProfilePostsTab = "posts" | "tagged";

export function useProfilePosts(
	username: string,
	tab: ProfilePostsTab,
	canViewPosts = true,
) {
	return useInfiniteQuery({
		queryKey: ["users", username, tab] as const,
		queryFn: ({ pageParam }) =>
			tab === "posts"
				? getUserPostsFn({ data: { username, cursor: pageParam } })
				: getUserTaggedPostsFn({ data: { username, cursor: pageParam } }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: Boolean(username) && canViewPosts,
	});
}

export function useToggleFollow() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (username: string) => toggleFollowFn({ data: { username } }),
		onSuccess: (_data, username) => {
			void queryClient.invalidateQueries({
				queryKey: ["users", username, "profile"],
			});
			void queryClient.invalidateQueries({
				queryKey: ["users", "suggestions"],
			});
			void queryClient.invalidateQueries({ queryKey: ["feed"] });
			void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
			void queryClient.invalidateQueries({
				queryKey: ["users", username, "followers"],
			});
			void queryClient.invalidateQueries({
				queryKey: ["users", username, "following"],
			});
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (formData: FormData) => updateProfileFn({ data: formData }),
		onSuccess: (user) => {
			queryClient.setQueryData(currentUserQueryOptions.queryKey, user);
			void queryClient.invalidateQueries({
				queryKey: ["users", user.username],
			});
		},
	});
}

export function useTogglePrivate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (isPrivate: boolean) => {
			return updatePrivacyFn({ data: { isPrivate } });
		},
		onSuccess: (user) => {
			queryClient.setQueryData(currentUserQueryOptions.queryKey, user);
			void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
			void queryClient.invalidateQueries({ queryKey: ["users", user.username] });
			void queryClient.invalidateQueries({ queryKey: ["feed"] });
			toast.success(user.isPrivate ? "Account is now private" : "Account is now public");
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		},
	});
}

export function useUserFollowers(username: string) {
	return useInfiniteQuery({
		queryKey: ["users", username, "followers"] as const,
		queryFn: ({ pageParam }) =>
			getUserFollowersFn({ data: { username, cursor: pageParam } }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: Boolean(username),
	});
}

export function useUserFollowing(username: string) {
	return useInfiniteQuery({
		queryKey: ["users", username, "following"] as const,
		queryFn: ({ pageParam }) =>
			getUserFollowingFn({ data: { username, cursor: pageParam } }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: Boolean(username),
	});
}

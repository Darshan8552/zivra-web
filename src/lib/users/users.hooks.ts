import { queryOptions, useInfiniteQuery } from "@tanstack/react-query";
import {
  getUserPostsFn,
  getUserProfileFn,
  getUserTaggedPostsFn,
} from "#/lib/users/users.function.ts";

export const userProfileQueryOptions = (username: string) =>
  queryOptions({
    queryKey: ["users", username, "profile"] as const,
    queryFn: () => getUserProfileFn({ data: { username } }),
    enabled: Boolean(username),
  });

export type ProfilePostsTab = "posts" | "tagged";

export function useProfilePosts(username: string, tab: ProfilePostsTab) {
  return useInfiniteQuery({
    queryKey: ["users", username, tab] as const,
    queryFn: ({ pageParam }) =>
      tab === "posts"
        ? getUserPostsFn({ data: { username, cursor: pageParam } })
        : getUserTaggedPostsFn({ data: { username, cursor: pageParam } }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(username),
  });
}

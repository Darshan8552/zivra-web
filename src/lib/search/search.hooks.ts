import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "#/lib/use-debounced-value.ts";
import {
  searchPostsFn,
  searchUsersFn,
  suggestHashtagsFn,
} from "#/lib/search/search.function.ts";

export function useSearchUsers(q: string, limit = 5) {
  const debounced = useDebouncedValue(q.trim(), 300);
  return useQuery({
    queryKey: ["search", "people", debounced, limit] as const,
    queryFn: () => searchUsersFn({ data: { q: debounced, limit } }),
    enabled: debounced.length > 0,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useHashtagSuggestions(q: string, limit = 5) {
  const debounced = useDebouncedValue(q.trim(), 300);
  return useQuery({
    queryKey: ["search", "tags", debounced, limit] as const,
    queryFn: () => suggestHashtagsFn({ data: { q: debounced, limit } }),
    enabled: debounced.length > 0,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useSearchPosts(q: string, limit = 12) {
  const debounced = useDebouncedValue(q.trim(), 300);
  return useInfiniteQuery({
    queryKey: ["search", "posts", debounced, limit] as const,
    queryFn: ({ pageParam }) =>
      searchPostsFn({
        data: {
          q: debounced,
          cursor: pageParam as string | undefined,
          limit,
        },
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: debounced.length > 0,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useTrendingHashtags(limit = 12) {
  return useQuery({
    queryKey: ["search", "trending", "tags", limit] as const,
    queryFn: () => suggestHashtagsFn({ data: { q: "", limit } }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export function useTrendingPosts(limit = 12) {
  return useInfiniteQuery({
    queryKey: ["search", "trending", "posts", limit] as const,
    queryFn: ({ pageParam }) =>
      searchPostsFn({
        data: { q: "", cursor: pageParam as string | undefined, limit },
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

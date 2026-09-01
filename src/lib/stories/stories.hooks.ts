import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { BackendApiError } from "#/lib/config/backend-client.ts";
import { getErrorMessage } from "#/lib/auth/auth.hooks.ts";
import {
  createStoryFn,
  deleteStoryFn,
  getStoriesFeedFn,
  getUserStoriesFn,
  viewStoryFn,
} from "#/lib/stories/stories.function.ts";

function isAuthError(error: unknown): boolean {
  return error instanceof BackendApiError && error.statusCode === 401;
}

export function useStoriesFeed(limit = 20) {
  return useInfiniteQuery({
    queryKey: ["stories", "feed", limit] as const,
    queryFn: ({ pageParam }) =>
      getStoriesFeedFn({
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

export function useUserStories(username: string) {
  return useQuery({
    queryKey: ["stories", username] as const,
    queryFn: () => getUserStoriesFn({ data: { username } }),
    enabled: Boolean(username),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: (failureCount, error) => !isAuthError(error) && failureCount < 2,
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createStoryFn({ data: formData }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stories"] });
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create story"));
    },
  });
}

export function useViewStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) => viewStoryFn({ data: { storyId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to mark story as viewed"));
    },
  });
}

export function useDeleteStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storyId: string) => deleteStoryFn({ data: { storyId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stories"] });
      toast.success("Story deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete story"));
    },
  });
}

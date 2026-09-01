import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { BackendApiError } from "#/lib/config/backend-client.ts";
import { getErrorMessage } from "#/lib/auth/auth.hooks.ts";
import {
  addCloseFriendFn,
  getCloseFriendsFn,
  removeCloseFriendFn,
} from "#/lib/close-friends/close-friends.function.ts";

function isAuthError(error: unknown): boolean {
  return error instanceof BackendApiError && error.statusCode === 401;
}

export function useCloseFriends() {
  return useQuery({
    queryKey: ["close-friends"] as const,
    queryFn: () => getCloseFriendsFn(),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: (failureCount, error) => !isAuthError(error) && failureCount < 2,
  });
}

export function useAddCloseFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => addCloseFriendFn({ data: { username } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["close-friends"] });
      toast.success("Added to close friends");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to add close friend"));
    },
  });
}

export function useRemoveCloseFriend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (friendId: string) =>
      removeCloseFriendFn({ data: { friendId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["close-friends"] });
      toast.success("Removed from close friends");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to remove close friend"));
    },
  });
}

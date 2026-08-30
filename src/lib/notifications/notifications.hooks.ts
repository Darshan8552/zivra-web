import {
  infiniteQueryOptions,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "../auth/auth.hooks";
import {
  acceptFollowRequestFn,
  declineFollowRequestFn,
  getNotificationsFn,
  getUnreadCountFn,
  markAllNotificationsReadFn,
  markNotificationReadFn,
} from "#/lib/notifications/notifications.function.ts";

export const notificationsQueryOptions = infiniteQueryOptions({
  queryKey: ["notifications"] as const,
  queryFn: ({ pageParam }) =>
    getNotificationsFn({ data: { cursor: pageParam } }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});

export const unreadCountQueryOptions = queryOptions({
  queryKey: ["notifications", "unread-count"] as const,
  queryFn: () => getUnreadCountFn(),
});

export function useNotifications() {
  return useInfiniteQuery(notificationsQueryOptions);
}

export function useUnreadNotificationCount() {
  return useQuery(unreadCountQueryOptions);
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationReadFn({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsReadFn(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
}

export function useAcceptFollowRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actorId: string) =>
      acceptFollowRequestFn({ data: { actorId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeclineFollowRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actorId: string) =>
      declineFollowRequestFn({ data: { actorId } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

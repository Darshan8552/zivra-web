import { createServerFn } from "@tanstack/react-start";
import { backendRequest } from "#/lib/config/backend-client.ts";
import { getValidAccessToken } from "#/lib/config/session.server.ts";
import type {
  NotificationsPage,
  UnreadCount,
} from "#/lib/notifications/notifications.types.ts";

async function requireAccessToken(): Promise<string> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("You must be signed in to do that.");
  return token;
}

export const getNotificationsFn = createServerFn({ method: "GET" })
  .validator((data: { cursor?: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    const params = new URLSearchParams();
    if (data.cursor) params.set("cursor", data.cursor);
    if (data.limit) params.set("limit", String(data.limit));
    const query = params.toString();
    return backendRequest<NotificationsPage>(
      `/notifications${query ? `?${query}` : ""}`,
      { bearerToken: accessToken },
    );
  });

export const getUnreadCountFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const accessToken = await requireAccessToken();
    return backendRequest<UnreadCount>(`/notifications/unread-count`, {
      bearerToken: accessToken,
    });
  },
);

export const markAllNotificationsReadFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const accessToken = await requireAccessToken();
    return backendRequest<{ success: boolean }>(
      `/notifications/read-all`,
      { method: "PATCH", bearerToken: accessToken },
    );
  });

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    return backendRequest<{ id: string }>(
      `/notifications/${data.id}/read`,
      { method: "PATCH", bearerToken: accessToken },
    );
  });

export const acceptFollowRequestFn = createServerFn({ method: "POST" })
  .validator((data: { actorId: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    return backendRequest<{ success: boolean }>(
      `/users/me/follow/accept`,
      { method: "PATCH", bearerToken: accessToken, body: { actorId: data.actorId } },
    );
  });

export const declineFollowRequestFn = createServerFn({ method: "POST" })
  .validator((data: { actorId: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    return backendRequest<{ success: boolean }>(
      `/users/me/follow/decline`,
      { method: "PATCH", bearerToken: accessToken, body: { actorId: data.actorId } },
    );
  });

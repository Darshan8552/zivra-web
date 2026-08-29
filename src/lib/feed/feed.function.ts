import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import {
  BackendApiError,
  backendRequest,
} from "#/lib/config/backend-client.ts";
import {
  clearAuthCookies,
  getValidAccessToken,
} from "#/lib/config/session.server.ts";
import type { FeedPage } from "#/lib/feed/feed.types.ts";
import { feedQuerySchema } from "#/lib/feed/feed.validator.ts";

async function requireAccessToken(): Promise<string> {
  const token = await getValidAccessToken();
  if (!token) throw redirect({ to: "/signin" });
  return token;
}

export const getFollowingFeedFn = createServerFn({ method: "GET" })
  .validator(feedQuerySchema)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    const params = new URLSearchParams();
    if (data.cursor) params.set("cursor", data.cursor);
    if (data.limit) params.set("limit", String(data.limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    try {
      return await backendRequest<FeedPage>(`/feed/following${qs}`, {
        bearerToken: accessToken,
      });
    } catch (error) {
      if (error instanceof BackendApiError && error.statusCode === 401) {
        clearAuthCookies();
        throw redirect({ to: "/signin" });
      }
      throw error;
    }
  });

export const getDiscoveryFeedFn = createServerFn({ method: "GET" })
  .validator(feedQuerySchema)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    const params = new URLSearchParams();
    if (data.cursor) params.set("cursor", data.cursor);
    if (data.limit) params.set("limit", String(data.limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    try {
      return await backendRequest<FeedPage>(`/feed/discovery${qs}`, {
        bearerToken: accessToken,
      });
    } catch (error) {
      if (error instanceof BackendApiError && error.statusCode === 401) {
        clearAuthCookies();
        throw redirect({ to: "/signin" });
      }
      throw error;
    }
  });

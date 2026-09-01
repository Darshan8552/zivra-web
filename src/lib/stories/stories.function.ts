import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { z } from "zod";
import {
  BackendApiError,
  backendMultipartRequest,
  backendRequest,
} from "#/lib/config/backend-client.ts";
import {
  clearAuthCookies,
  getValidAccessToken,
} from "#/lib/config/session.server.ts";
import type { StoriesPage, Story } from "#/lib/stories/stories.types.ts";

async function requireAccessToken(): Promise<string> {
  const token = await getValidAccessToken();
  if (!token) throw redirect({ to: "/signin" });
  return token;
}

const storiesFeedQuerySchema = z
  .object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  })
  .optional();

export const getStoriesFeedFn = createServerFn({ method: "GET" })
  .validator(storiesFeedQuerySchema)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    const params = new URLSearchParams();
    if (data?.cursor) params.set("cursor", data.cursor);
    if (data?.limit) params.set("limit", String(data.limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    try {
      return await backendRequest<StoriesPage>(`/stories/feed${qs}`, {
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

export const getUserStoriesFn = createServerFn({ method: "GET" })
  .validator((data: { username: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    try {
      return await backendRequest<Story[]>(
        `/stories/users/${encodeURIComponent(data.username)}`,
        { bearerToken: accessToken },
      );
    } catch (error) {
      if (error instanceof BackendApiError && error.statusCode === 401) {
        clearAuthCookies();
        throw redirect({ to: "/signin" });
      }
      throw error;
    }
  });

export const createStoryFn = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("FormData required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const accessToken = await getValidAccessToken();
    if (!accessToken) throw redirect({ to: "/signin" });
    try {
      return await backendMultipartRequest<Story>("/stories", data, {
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

export const viewStoryFn = createServerFn({ method: "POST" })
  .validator((data: { storyId: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    try {
      return await backendRequest<{ success: boolean }>(
        `/stories/${encodeURIComponent(data.storyId)}/view`,
        { method: "POST", bearerToken: accessToken },
      );
    } catch (error) {
      if (error instanceof BackendApiError && error.statusCode === 401) {
        clearAuthCookies();
        throw redirect({ to: "/signin" });
      }
      throw error;
    }
  });

export const deleteStoryFn = createServerFn({ method: "POST" })
  .validator((data: { storyId: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    try {
      return await backendRequest<{ id: string }>(
        `/stories/${encodeURIComponent(data.storyId)}`,
        { method: "DELETE", bearerToken: accessToken },
      );
    } catch (error) {
      if (error instanceof BackendApiError && error.statusCode === 401) {
        clearAuthCookies();
        throw redirect({ to: "/signin" });
      }
      throw error;
    }
  });

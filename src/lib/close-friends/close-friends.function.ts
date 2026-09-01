import { createServerFn } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { z } from "zod";
import {
  BackendApiError,
  backendRequest,
} from "#/lib/config/backend-client.ts";
import {
  clearAuthCookies,
  getValidAccessToken,
} from "#/lib/config/session.server.ts";
import type { CloseFriend } from "#/lib/close-friends/close-friends.types.ts";

async function requireAccessToken(): Promise<string> {
  const token = await getValidAccessToken();
  if (!token) throw redirect({ to: "/signin" });
  return token;
}

export const getCloseFriendsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const accessToken = await requireAccessToken();
    try {
      return await backendRequest<CloseFriend[]>("/close-friends", {
        bearerToken: accessToken,
      });
    } catch (error) {
      if (error instanceof BackendApiError && error.statusCode === 401) {
        clearAuthCookies();
        throw redirect({ to: "/signin" });
      }
      throw error;
    }
  },
);

export const addCloseFriendFn = createServerFn({ method: "POST" })
  .validator(z.object({ username: z.string().min(1) }))
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    try {
      return await backendRequest<CloseFriend>("/close-friends", {
        method: "POST",
        bearerToken: accessToken,
        body: { username: data.username },
      });
    } catch (error) {
      if (error instanceof BackendApiError && error.statusCode === 401) {
        clearAuthCookies();
        throw redirect({ to: "/signin" });
      }
      throw error;
    }
  });

export const removeCloseFriendFn = createServerFn({ method: "POST" })
  .validator(z.object({ friendId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    try {
      return await backendRequest<{ id: string }>(
        `/close-friends/${encodeURIComponent(data.friendId)}`,
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

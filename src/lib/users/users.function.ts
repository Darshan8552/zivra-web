import { createServerFn } from "@tanstack/react-start";
import {
  backendMultipartRequest,
  backendRequest,
} from "#/lib/config/backend-client.ts";
import { getValidAccessToken } from "#/lib/config/session.server.ts";
import type {
  FollowListPage,
  FollowState,
  ProfilePostsPage,
  SuggestionUser,
  UserProfile,
} from "#/lib/users/users.types.ts";
import type { AuthUser } from "#/lib/auth/auth.types.ts";

async function requireAccessToken(): Promise<string> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("You must be signed in to do that.");
  return token;
}

export const getSuggestionsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const accessToken = await requireAccessToken();
    return backendRequest<SuggestionUser[]>(`/users/suggestions`, {
      bearerToken: accessToken,
    });
  },
);

export const toggleFollowFn = createServerFn({ method: "POST" })
  .validator((data: { username: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    return backendRequest<FollowState>(
      `/users/${encodeURIComponent(data.username)}/follow`,
      { method: "POST", bearerToken: accessToken },
    );
  });

export const getUserProfileFn = createServerFn({ method: "GET" })
  .validator((data: { username: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    return backendRequest<UserProfile>(
      `/users/${encodeURIComponent(data.username)}`,
      { bearerToken: accessToken },
    );
  });

export const getUserPostsFn = createServerFn({ method: "GET" })
  .validator((data: { username: string; cursor?: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    const query = data.cursor
      ? `?cursor=${encodeURIComponent(data.cursor)}`
      : "";
    return backendRequest<ProfilePostsPage>(
      `/users/${encodeURIComponent(data.username)}/posts${query}`,
      { bearerToken: accessToken },
    );
  });

export const getUserTaggedPostsFn = createServerFn({ method: "GET" })
  .validator((data: { username: string; cursor?: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    const query = data.cursor
      ? `?cursor=${encodeURIComponent(data.cursor)}`
      : "";
    return backendRequest<ProfilePostsPage>(
      `/users/${encodeURIComponent(data.username)}/tagged-posts${query}`,
      { bearerToken: accessToken },
    );
  });

export const updateProfileFn = createServerFn({ method: "POST" })
  .validator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error("Expected form data");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    return backendMultipartRequest<AuthUser>("/users/me", data, {
      method: "PATCH",
      bearerToken: accessToken,
    });
  });

export const getUserFollowersFn = createServerFn({ method: "GET" })
  .validator((data: { username: string; cursor?: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    const query = data.cursor
      ? `?cursor=${encodeURIComponent(data.cursor)}`
      : "";
    return backendRequest<FollowListPage>(
      `/users/${encodeURIComponent(data.username)}/followers${query}`,
      { bearerToken: accessToken },
    );
  });

export const getUserFollowingFn = createServerFn({ method: "GET" })
  .validator((data: { username: string; cursor?: string }) => data)
  .handler(async ({ data }) => {
    const accessToken = await requireAccessToken();
    const query = data.cursor
      ? `?cursor=${encodeURIComponent(data.cursor)}`
      : "";
    return backendRequest<FollowListPage>(
      `/users/${encodeURIComponent(data.username)}/following${query}`,
      { bearerToken: accessToken },
    );
  });

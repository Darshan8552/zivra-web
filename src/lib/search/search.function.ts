import { createServerFn } from "@tanstack/react-start";
import { backendRequest } from "#/lib/config/backend-client.ts";
import { getValidAccessToken } from "#/lib/config/session.server.ts";
import type { SearchPostsPage } from "#/lib/search/search.types.ts";

async function requireAccessToken(): Promise<string> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("You must be signed in to do that.");
  return token;
}

export const searchPostsFn = createServerFn({ method: "GET" })
  .validator(
    (data: { q?: string; cursor?: string; limit?: number } = {}) => data,
  )
  .handler(async ({ data }) => {
    const token = await requireAccessToken();
    const params = new URLSearchParams();
    if (data.q?.trim()) params.set("q", data.q.trim());
    if (data.cursor) params.set("cursor", data.cursor);
    if (data.limit) params.set("limit", String(data.limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return backendRequest<SearchPostsPage>(`/posts/search${qs}`, {
      bearerToken: token,
    });
  });

export const getHashtagPostsFn = createServerFn({ method: "GET" })
  .validator((data: { name: string; cursor?: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    const token = await requireAccessToken();
    const params = new URLSearchParams();
    if (data.cursor) params.set("cursor", data.cursor);
    if (data.limit) params.set("limit", String(data.limit));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return backendRequest<SearchPostsPage>(
      `/hashtags/${encodeURIComponent(data.name)}/posts${qs}`,
      { bearerToken: token },
    );
  });

// Re-export for single-import convenience (actual impl lives in users/posts)
export { searchUsersFn } from "#/lib/users/users.function.ts";
export { suggestHashtagsFn } from "#/lib/posts/posts.function.ts";

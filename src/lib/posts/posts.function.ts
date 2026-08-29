import { createServerFn } from "@tanstack/react-start";
import {
	backendMultipartRequest,
	backendRequest,
} from "#/lib/config/backend-client.ts";
import { getValidAccessToken } from "#/lib/config/session.server.ts";
import type {
	HashtagSuggestion,
	Post,
	UserSuggestion,
} from "#/lib/posts/posts.types.ts";

export const suggestHashtagsFn = createServerFn({ method: "GET" })
	.validator((data: { q: string }) => data)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		const query = data.q.trim()
			? `?q=${encodeURIComponent(data.q.trim())}`
			: "";
		return backendRequest<HashtagSuggestion[]>(
			`/hashtags/suggestions${query}`,
			{ bearerToken: accessToken },
		);
	});

export const createPostFn = createServerFn({ method: "POST" })
	.validator((data) => {
		if (!(data instanceof FormData)) {
			throw new Error("Expected form data");
		}
		return data;
	})
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		return backendMultipartRequest<Post>("/posts", data, {
			bearerToken: accessToken,
		});
	});

export const searchUsersFn = createServerFn({ method: "GET" })
	.validator((data: { q: string; limit?: number }) => data)
	.handler(async ({ data }) => {
		const q = data.q.trim();
		if (!q) return [];
		const accessToken = await requireAccessToken();
		const params = new URLSearchParams({ q });
		if (data.limit) params.set("limit", String(data.limit));
		return backendRequest<UserSuggestion[]>(
			`/users/search?${params.toString()}`,
			{ bearerToken: accessToken },
		);
	});

export const getPostFn = createServerFn({ method: "GET" })
	.validator((data: { postId: string }) => data)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		return backendRequest<Post>(`/posts/${encodeURIComponent(data.postId)}`, {
			bearerToken: accessToken,
		});
	});

export const deletePostFn = createServerFn({ method: "POST" })
	.validator((data: { postId: string }) => data)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		return backendRequest<{ id: string }>(
			`/posts/${encodeURIComponent(data.postId)}`,
			{ bearerToken: accessToken, method: "DELETE" },
		);
	});

async function requireAccessToken(): Promise<string> {
	const token = await getValidAccessToken();
	if (!token) throw new Error("You must be signed in to do that.");
	return token;
}

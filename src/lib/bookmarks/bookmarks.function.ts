import { createServerFn } from "@tanstack/react-start";
import { backendRequest } from "#/lib/config/backend-client.ts";
import { getValidAccessToken } from "#/lib/config/session.server.ts";
import type { ProfilePostsPage } from "#/lib/users/users.types.ts";

export const toggleBookmarkFn = createServerFn({ method: "POST" })
	.validator((data: { postId: string }) => data)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		return backendRequest<{ bookmarked: boolean; postId: string }>(
			`/posts/${encodeURIComponent(data.postId)}/bookmark`,
			{ method: "POST", bearerToken: accessToken },
		);
	});

export const toggleBookmarkDeleteFn = createServerFn({ method: "POST" })
	.validator((data: { postId: string }) => data)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		return backendRequest<{ bookmarked: boolean; postId: string }>(
			`/posts/${encodeURIComponent(data.postId)}/bookmark`,
			{ method: "DELETE", bearerToken: accessToken },
		);
	});

export const getBookmarksFn = createServerFn({ method: "GET" })
	.validator((data: { cursor?: string; limit?: number }) => data)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		const params = new URLSearchParams();
		if (data.cursor) params.set("cursor", data.cursor);
		if (data.limit) params.set("limit", String(data.limit));
		const qs = params.toString() ? `?${params.toString()}` : "";
		return backendRequest<ProfilePostsPage>(`/bookmarks${qs}`, {
			bearerToken: accessToken,
		});
	});

async function requireAccessToken(): Promise<string> {
	const token = await getValidAccessToken();
	if (!token) throw new Error("You must be signed in to do that.");
	return token;
}

import { createServerFn } from "@tanstack/react-start";
import type { Comment, CommentsPage } from "#/lib/comments/comments.types.ts";
import { backendRequest } from "#/lib/config/backend-client.ts";
import { getValidAccessToken } from "#/lib/config/session.server.ts";

export const getCommentsFn = createServerFn({ method: "GET" })
	.validator(
		(data: { postId: string; cursor?: string; limit?: number }) => data,
	)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		const query = new URLSearchParams();
		if (data.cursor) query.set("cursor", data.cursor);
		if (data.limit) query.set("limit", String(data.limit));
		return backendRequest<CommentsPage>(
			`/posts/${encodeURIComponent(data.postId)}/comments${query.toString() ? `?${query}` : ""}`,
			{ bearerToken: accessToken },
		);
	});

export const createCommentFn = createServerFn({ method: "POST" })
	.validator(
		(data: { postId: string; content: string; parentId?: string }) => data,
	)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		return backendRequest<Comment>(
			`/posts/${encodeURIComponent(data.postId)}/comments`,
			{
				method: "POST",
				bearerToken: accessToken,
				body: { content: data.content, parentId: data.parentId },
			},
		);
	});

export const getCommentRepliesFn = createServerFn({ method: "GET" })
	.validator(
		(data: { commentId: string; cursor?: string; limit?: number }) => data,
	)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		const query = new URLSearchParams();
		if (data.cursor) query.set("cursor", data.cursor);
		if (data.limit) query.set("limit", String(data.limit));
		return backendRequest<CommentsPage>(
			`/comments/${encodeURIComponent(data.commentId)}/replies${query.toString() ? `?${query}` : ""}`,
			{ bearerToken: accessToken },
		);
	});

async function requireAccessToken(): Promise<string> {
	const token = await getValidAccessToken();
	if (!token) throw new Error("You must be signed in to do that.");
	return token;
}

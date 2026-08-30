import { createServerFn } from "@tanstack/react-start";
import { backendRequest } from "#/lib/config/backend-client.ts";
import { getValidAccessToken } from "#/lib/config/session.server.ts";

export const togglePostLikeFn = createServerFn({ method: "POST" })
	.validator((data: { postId: string }) => data)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		return backendRequest<{ liked: boolean; postId: string }>(
			`/posts/${encodeURIComponent(data.postId)}/like`,
			{ method: "POST", bearerToken: accessToken },
		);
	});

export const togglePostLikeDeleteFn = createServerFn({ method: "POST" })
	.validator((data: { postId: string }) => data)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		return backendRequest<{ liked: boolean; postId: string }>(
			`/posts/${encodeURIComponent(data.postId)}/like`,
			{ method: "DELETE", bearerToken: accessToken },
		);
	});

export const toggleCommentLikeFn = createServerFn({ method: "POST" })
	.validator((data: { commentId: string }) => data)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		return backendRequest<{ liked: boolean; commentId: string }>(
			`/comments/${encodeURIComponent(data.commentId)}/like`,
			{ method: "POST", bearerToken: accessToken },
		);
	});

export const toggleCommentLikeDeleteFn = createServerFn({ method: "POST" })
	.validator((data: { commentId: string }) => data)
	.handler(async ({ data }) => {
		const accessToken = await requireAccessToken();
		return backendRequest<{ liked: boolean; commentId: string }>(
			`/comments/${encodeURIComponent(data.commentId)}/like`,
			{ method: "DELETE", bearerToken: accessToken },
		);
	});

async function requireAccessToken(): Promise<string> {
	const token = await getValidAccessToken();
	if (!token) throw new Error("You must be signed in to do that.");
	return token;
}

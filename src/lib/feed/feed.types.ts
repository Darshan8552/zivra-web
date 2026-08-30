import type { Post } from "#/lib/posts/posts.types.ts";

export interface FeedPage {
	items: Post[];
	nextCursor: string | null;
}

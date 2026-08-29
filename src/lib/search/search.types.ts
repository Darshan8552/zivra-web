import type { Post } from "#/lib/posts/posts.types.ts";

export type SearchTab = "people" | "tags" | "posts";

export interface SearchPostsPage {
  items: Post[];
  nextCursor: string | null;
}

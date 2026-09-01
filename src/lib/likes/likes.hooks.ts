import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "#/lib/auth/auth.hooks.ts";
import {
	toggleCommentLikeDeleteFn,
	toggleCommentLikeFn,
	togglePostLikeDeleteFn,
	togglePostLikeFn,
} from "#/lib/likes/likes.function.ts";

type InfinitePage<T> = { items: T[]; nextCursor: string | null };
type InfiniteData<T> = { pages: InfinitePage<T>[]; pageParams: unknown[] };

function patchPostInData<T extends { id: string; liked?: boolean; _count?: { likes: number } }>(
  data: unknown,
  postId: string,
  nextLiked: boolean,
): unknown {
  if (!data || typeof data !== "object") return data;
  const maybePost = data as T;
  if (maybePost.id === postId) {
    const prevLiked = Boolean(maybePost.liked);
    if (prevLiked === nextLiked) return data;
    const delta = nextLiked ? 1 : -1;
    return {
      ...maybePost,
      liked: nextLiked,
      _count: maybePost._count ? { ...maybePost._count, likes: Math.max(0, maybePost._count.likes + delta) } : maybePost._count,
    };
  }
  const inf = data as InfiniteData<T>;
  if (Array.isArray(inf.pages)) {
    let changed = false;
    const pages = inf.pages.map((p) => {
      if (!Array.isArray(p.items)) return p;
      let pageChanged = false;
      const items = p.items.map((it) => {
        if (it.id !== postId) return it;
        const prevLiked = Boolean(it.liked);
        if (prevLiked === nextLiked) return it;
        pageChanged = true;
        const delta = nextLiked ? 1 : -1;
        return { ...it, liked: nextLiked, _count: it._count ? { ...it._count, likes: Math.max(0, it._count.likes + delta) } : it._count };
      });
      if (!pageChanged) return p;
      changed = true;
      return { ...p, items };
    });
    if (changed) return { ...inf, pages };
  }
  return data;
}

function patchCommentInData<T extends { id: string; liked?: boolean; _count?: { likes: number; replies?: number } }>(
  data: unknown,
  commentId: string,
  nextLiked: boolean,
): unknown {
  if (!data || typeof data !== "object") return data;
  const maybe = data as T;
  if (maybe.id === commentId) {
    const prevLiked = Boolean(maybe.liked);
    if (prevLiked === nextLiked) return data;
    const delta = nextLiked ? 1 : -1;
    return { ...maybe, liked: nextLiked, _count: maybe._count ? { ...maybe._count, likes: Math.max(0, maybe._count.likes + delta) } : maybe._count };
  }
  const inf = data as InfiniteData<T>;
  if (Array.isArray(inf.pages)) {
    let changed = false;
    const pages = inf.pages.map((p) => {
      if (!Array.isArray(p.items)) return p;
      let pageChanged = false;
      const items = p.items.map((it) => {
        if (it.id !== commentId) return it;
        const prevLiked = Boolean(it.liked);
        if (prevLiked === nextLiked) return it;
        pageChanged = true;
        const delta = nextLiked ? 1 : -1;
        return { ...it, liked: nextLiked, _count: it._count ? { ...it._count, likes: Math.max(0, it._count.likes + delta) } : it._count };
      });
      if (!pageChanged) return p;
      changed = true;
      return { ...p, items };
    });
    if (changed) return { ...inf, pages };
  }
  return data;
}

export function useTogglePostLike(postId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (liked: boolean) =>
			liked
				? togglePostLikeDeleteFn({ data: { postId } })
				: togglePostLikeFn({ data: { postId } }),
		onMutate: async (liked) => {
			const nextLiked = !liked;
			await queryClient.cancelQueries({ queryKey: ["feed"] });
			await queryClient.cancelQueries({ queryKey: ["posts"] });
			await queryClient.cancelQueries({ queryKey: ["search"] });
			await queryClient.cancelQueries({ queryKey: ["users"] });
			await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
			const snapshots = new Map<string, unknown>();
			const all = queryClient.getQueriesData({ predicate: () => true });
			for (const [key, data] of all) {
				const jsonKey = JSON.stringify(key);
				if (Array.isArray(key) && (key[0] === "feed" || key[0] === "posts" || key[0] === "search" || key[0] === "users" || key[0] === "bookmarks")) {
					const patched = patchPostInData(data, postId, nextLiked);
					if (patched !== data) {
						snapshots.set(jsonKey, data);
						queryClient.setQueryData(key, patched);
					}
				}
			}
			if (snapshots.size === 0) {
				console.warn("[like] no cache patched for", postId, "nextLiked", nextLiked);
			}
			return { snapshots, nextLiked };
		},
		onError: (error, _liked, ctx) => {
			if (ctx?.snapshots) {
				for (const [jsonKey, data] of ctx.snapshots) {
					const key = JSON.parse(jsonKey);
					queryClient.setQueryData(key, data);
				}
			}
			console.error("[like] toggle failed", error);
			toast.error(getErrorMessage(error, "Couldn't update like."));
		},
		onSettled: () => {
			// keep optimistic for feed (Redis cache 30s would revert), only sync single post/bookmarks from DB
			void queryClient.invalidateQueries({ queryKey: ["posts", postId] });
		},
	});
}

export function useToggleCommentLike(commentId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (liked: boolean) =>
			liked
				? toggleCommentLikeDeleteFn({ data: { commentId } })
				: toggleCommentLikeFn({ data: { commentId } }),
		onMutate: async (liked) => {
			const nextLiked = !liked;
			await queryClient.cancelQueries({ predicate: (q) => Array.isArray(q.queryKey) && (q.queryKey[0] === "posts" || q.queryKey[0] === "comments") });
			const snapshots = new Map<string, unknown>();
			const all = queryClient.getQueriesData({ predicate: () => true });
			for (const [key, data] of all) {
				if (!Array.isArray(key)) continue;
				if (key[0] === "posts" || key[0] === "comments") {
					const patched = patchCommentInData(data, commentId, nextLiked);
					if (patched !== data) {
						snapshots.set(JSON.stringify(key), data);
						queryClient.setQueryData(key, patched);
					}
				}
			}
			return { snapshots, nextLiked };
		},
		onError: (error, _liked, ctx) => {
			if (ctx?.snapshots) {
				for (const [jsonKey, data] of ctx.snapshots) {
					const key = JSON.parse(jsonKey);
					queryClient.setQueryData(key, data);
				}
			}
			console.error("[comment-like] toggle failed", error);
			toast.error(getErrorMessage(error, "Couldn't update like."));
		},
		onSettled: () => {
			// keep optimistic for list, no immediate invalidate to avoid snap-back
		},
	});
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "#/lib/auth/auth.hooks.ts";
import {
	toggleCommentLikeDeleteFn,
	toggleCommentLikeFn,
	togglePostLikeDeleteFn,
	togglePostLikeFn,
} from "#/lib/likes/likes.function.ts";

export function useTogglePostLike(postId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (liked: boolean) =>
			liked
				? togglePostLikeDeleteFn({ data: { postId } })
				: togglePostLikeFn({ data: { postId } }),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["posts", postId] });
			void queryClient.invalidateQueries({ queryKey: ["feed"] });
		},
		onError: (error) =>
			toast.error(getErrorMessage(error, "Couldn't update like.")),
	});
}

export function useToggleCommentLike(commentId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (liked: boolean) =>
			liked
				? toggleCommentLikeDeleteFn({ data: { commentId } })
				: toggleCommentLikeFn({ data: { commentId } }),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: ["comments", commentId, "replies"],
			});
		},
		onError: (error) =>
			toast.error(getErrorMessage(error, "Couldn't update like.")),
	});
}

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PostDetail } from "#/components/PostDetail.tsx";
import { getPostFn } from "#/lib/posts/posts.function.ts";
import { usePost } from "#/lib/posts/posts.hooks.ts";
import { currentUserQueryOptions } from "#/lib/query.options.ts";
import type { Post } from "#/lib/posts/posts.types.ts";

const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://zivra.app";

function cloudinaryOgImage(url: string): string {
	if (!url.includes("/upload/")) return url;
	if (url.includes("f_auto")) {
		if (url.includes("w_")) {
			return url.replace(/w_\d+/, "w_1200");
		}
		if (url.includes("f_auto,q_auto")) {
			return url.replace("f_auto,q_auto", "f_auto,q_auto,w_1200");
		}
		return url.replace("f_auto", "f_auto,q_auto,w_1200");
	}
	return url.replace("/upload/", "/upload/f_auto,q_auto,w_1200/");
}

export const Route = createFileRoute("/_main/posts/$postId/")({
	component: PostDetailPage,
	loader: ({ params }) => getPostFn({ data: { postId: params.postId } }),
	head: ({ loaderData }) => {
		const post = loaderData as unknown as Post | undefined;
		if (!post || !post.user) {
			return {
				meta: [
					{ title: "Post — Zivra" },
					{
						name: "description",
						content: "View this post on Zivra — share moments, follow creators, discover.",
					},
					{ property: "og:title", content: "Post — Zivra" },
					{
						property: "og:description",
						content: "View this post on Zivra — share moments, follow creators, discover.",
					},
					{ property: "og:type", content: "article" },
					{ name: "twitter:card", content: "summary_large_image" },
				],
				links: [
					{
						rel: "canonical",
						href: SITE_URL,
					},
				],
			};
		}
		const trimmed = post.caption?.trim() ?? "";
		const titleBase = trimmed ? trimmed.slice(0, 60) : `Post by @${post.user.username}`;
		const title = titleBase.length < 60 || !trimmed ? titleBase : `${titleBase}…`;
		const description = trimmed ? trimmed.slice(0, 160) : `Photo by @${post.user.username} on Zivra`;
		const ogImageRaw = post.media?.[0]?.url;
		const ogImage = ogImageRaw ? cloudinaryOgImage(ogImageRaw) : `${SITE_URL}/og-image.png`;
		const postUrl = `${SITE_URL}/posts/${post.id}`;
		return {
			meta: [
				{ title },
				{ name: "description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:image", content: ogImage },
				{ property: "og:type", content: "article" },
				{ property: "og:url", content: postUrl },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: ogImage },
			],
			links: [
				{
					rel: "canonical",
					href: postUrl,
				},
			],
		};
	},
});

function PostDetailPage() {
	const { postId } = Route.useParams();
	const { data: post, isLoading, isError } = usePost(postId);
	const { data: currentUser } = useQuery(currentUserQueryOptions);

	if (isLoading) {
		return (
			<div className="px-4 sm:px-6 lg:px-10 py-8">
				<div className="max-w-2xl mx-auto">
					<div className="h-10 w-10 rounded-full bg-secondary animate-pulse mb-4" />
					<div className="aspect-square rounded-2xl bg-secondary animate-pulse" />
				</div>
			</div>
		);
	}

	if (isError || !post) {
		return (
			<div className="px-4 sm:px-6 lg:px-10 pt-24">
				<div className="max-w-2xl mx-auto text-center">
					<p className="overline text-muted-foreground">Not found</p>
					<p className="font-display text-3xl tracking-tight mt-2">
						This post doesn't exist
					</p>
					<Link
						to="/feed"
						className="mt-6 inline-block text-sm font-semibold text-accent hover:underline"
					>
						Back to feed
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="px-4 sm:px-6 lg:px-10 py-8">
			<PostDetail post={post} currentUserId={currentUser?.id} />
		</div>
	);
}

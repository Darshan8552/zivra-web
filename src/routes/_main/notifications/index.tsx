import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	AtSign,
	Check,
	CheckCheck,
	Heart,
	MessageSquare,
	UserCheck,
	UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	useAcceptFollowRequest,
	useDeclineFollowRequest,
	useMarkAllNotificationsRead,
	useMarkNotificationRead,
	useNotifications,
} from "#/lib/notifications/notifications.hooks.ts";
import type {
	AppNotification,
	NotificationType,
} from "#/lib/notifications/notifications.types.ts";
import { useToggleFollow } from "#/lib/users/users.hooks.ts";
import { timeAgo } from "#/lib/utils.ts";

export const Route = createFileRoute("/_main/notifications/")({
	component: NotificationPage,
});

const FILTERS = ["All", "Mentions", "Follows", "Likes"] as const;
type Filter = (typeof FILTERS)[number];

const iconFor: Record<NotificationType, typeof Heart> = {
	LIKE: Heart,
	COMMENT: MessageSquare,
	FOLLOW: UserPlus,
	FOLLOW_REQUEST: UserPlus,
	FOLLOW_ACCEPTED: UserCheck,
	MENTION: AtSign,
	MESSAGE: MessageSquare,
	STORY_REPLY: MessageSquare,
	SYSTEM: Check,
};

function TimeAgo({ iso }: { iso: string }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) {
		return <>{new Date(iso).toLocaleDateString()}</>;
	}
	return <>{timeAgo(iso)}</>;
}

function matchesFilter(type: NotificationType, filter: Filter): boolean {
	switch (filter) {
		case "Mentions":
			return type === "MENTION";
		case "Likes":
			return type === "LIKE";
		case "Follows":
			return (
				type === "FOLLOW" ||
				type === "FOLLOW_REQUEST" ||
				type === "FOLLOW_ACCEPTED"
			);
		default:
			return true;
	}
}

function textFor(n: AppNotification): string {
	const name = n.actor?.name ?? "Someone";
	switch (n.type) {
		case "FOLLOW":
			return `${name} started following you`;
		case "FOLLOW_REQUEST":
			return `${name} requested to follow you`;
		case "FOLLOW_ACCEPTED":
			return `${name} accepted your follow request`;
		case "LIKE":
			return `${name} liked your post`;
		case "COMMENT":
			return `${name} commented on your post`;
		case "MENTION":
			return `${name} mentioned you`;
		default:
			return n.message ?? `${name} interacted with you`;
	}
}

function NotificationPage() {
	const navigate = useNavigate();
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useNotifications();
	const markAll = useMarkAllNotificationsRead();
	const markRead = useMarkNotificationRead();
	const accept = useAcceptFollowRequest();
	const decline = useDeclineFollowRequest();
	const toggleFollow = useToggleFollow();
	const queryClient = useQueryClient();

	const [filter, setFilter] = useState<Filter>("All");
	const [optimisticFollowing, setOptimisticFollowing] = useState<
		Record<string, boolean>
	>({});

	const isFollowing = (n: AppNotification) =>
		n.isFollowingActor || optimisticFollowing[n.id];

	const items = (data?.pages.flatMap((p) => p.items) ?? []).filter((n) =>
		matchesFilter(n.type, filter),
	);

	const openActor = (n: AppNotification, e?: React.MouseEvent) => {
		e?.stopPropagation();
		if (!n.actor) return;
		if (!n.isRead) markRead.mutate(n.id);
		void navigate({
			to: "/users/$username",
			params: { username: n.actor.username },
		});
	};

	const openNotification = (n: AppNotification) => {
		if (!n.isRead) markRead.mutate(n.id);
		if (
			(n.type === "LIKE" || n.type === "COMMENT") &&
			n.entityId &&
			n.entityType === "POST"
		) {
			void navigate({
				to: "/posts/$postId",
				params: { postId: n.entityId },
			});
			return;
		}
		if (n.actor) {
			void navigate({
				to: "/users/$username",
				params: { username: n.actor.username },
			});
		}
	};

	const renderActions = (n: AppNotification) => {
		if ((n.type === "LIKE" || n.type === "COMMENT") && n.entityType === "POST" && n.entityId) {
			return (
				<button
					type="button"
					data-testid={`notif-view-post-${n.id}`}
					onClick={(e) => {
						e.stopPropagation();
						if (!n.isRead) markRead.mutate(n.id);
						void navigate({
							to: "/posts/$postId",
							params: { postId: n.entityId! },
						});
					}}
					className="text-xs font-semibold px-4 h-9 rounded-full border border-border hover:border-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200 shrink-0"
				>
					View post
				</button>
			);
		}

		if (!n.actor) return null;

		if (n.type === "FOLLOW_REQUEST" && n.isFollowRequestPending && n.actorId) {
			return (
				<div className="flex items-center gap-2 shrink-0">
					<button
						type="button"
						data-testid={`notif-accept-${n.id}`}
						disabled={accept.isPending}
						onClick={(e) => {
							e.stopPropagation();
							if (!n.actorId) return;
							accept.mutate(n.actorId);
						}}
						className="text-xs font-semibold px-3 h-9 rounded-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-colors duration-200 disabled:opacity-60"
					>
						Accept
					</button>
					<button
						type="button"
						data-testid={`notif-decline-${n.id}`}
						disabled={decline.isPending}
						onClick={(e) => {
							e.stopPropagation();
							if (!n.actorId) return;
							decline.mutate(n.actorId);
						}}
						className="text-xs font-semibold px-3 h-9 rounded-full border border-border hover:border-foreground transition-colors duration-200 disabled:opacity-60"
					>
						Decline
					</button>
				</div>
			);
		}

		if (
			n.actor &&
			(n.type === "FOLLOW" || n.type === "FOLLOW_REQUEST") &&
			!isFollowing(n)
		) {
			return (
				<button
					type="button"
					data-testid={`notif-follow-back-${n.id}`}
					disabled={toggleFollow.isPending}
					onClick={(e) => {
						e.stopPropagation();
						toggleFollow.mutate(n.actor!.username, {
							onSuccess: () => {
								setOptimisticFollowing((p) => ({ ...p, [n.id]: true }));
								void queryClient.invalidateQueries({
									queryKey: ["notifications"],
								});
							},
						});
					}}
					className="text-xs font-semibold px-4 h-9 rounded-full bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-colors duration-200 shrink-0 disabled:opacity-60"
				>
					Follow back
				</button>
			);
		}

		if (
			(n.type === "FOLLOW" ||
				n.type === "FOLLOW_REQUEST" ||
				n.type === "FOLLOW_ACCEPTED") &&
			isFollowing(n)
		) {
			return (
				<span
					data-testid={`notif-following-${n.id}`}
					className="text-xs font-semibold px-4 h-9 rounded-full border border-border flex items-center gap-1.5 text-muted-foreground shrink-0"
				>
					<CheckCheck size={13} strokeWidth={2} /> Following
				</span>
			);
		}

		return null;
	};

	return (
		<div className="px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
			<div className="max-w-3xl mx-auto">
				<header className="flex items-end justify-between border-b border-border pb-6 mb-8">
					<div>
						<p className="overline text-accent">Latest</p>
						<h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mt-2">
							Notifications
						</h1>
					</div>
					<button
						type="button"
						data-testid="notifications-mark-all-btn"
						disabled={markAll.isPending}
						onClick={() => markAll.mutate()}
						className="text-xs font-semibold px-3 h-9 rounded-full border border-border hover:border-foreground transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-60"
					>
						<Check size={14} strokeWidth={1.75} /> Mark all as read
					</button>
				</header>

				<div className="mb-6 flex gap-2">
					{FILTERS.map((t) => (
						<button
							key={t}
							type="button"
							data-testid={`notif-filter-${t.toLowerCase()}`}
							onClick={() => setFilter(t)}
							className={`px-3 h-8 rounded-full text-xs font-semibold transition-colors duration-200 ${
								filter === t
									? "bg-foreground text-background"
									: "border border-border text-muted-foreground hover:text-foreground hover:border-foreground"
							}`}
						>
							{t}
						</button>
					))}
				</div>

				{isLoading ? (
					<div className="space-y-4">
						{[0, 1, 2, 3].map((i) => (
							<div
								key={i}
								className="h-16 rounded-xl bg-secondary animate-pulse"
							/>
						))}
					</div>
				) : items.length === 0 ? (
					<div className="py-24 text-center">
						<p className="font-display text-2xl tracking-tight">
							You're all caught up
						</p>
						<p className="text-muted-foreground mt-2 text-sm">
							Nothing to show here yet.
						</p>
					</div>
				) : (
					<div className="divide-y divide-border">
						{items.map((n) => {
							const Icon = iconFor[n.type];
							const actor = n.actor;
							const avatar = actor?.avatarUrl;
							return (
								<div
									key={n.id}
									data-testid={`notif-${n.id}`}
									onClick={() => openNotification(n)}
									className={`flex items-center gap-4 py-5 group cursor-pointer ${!n.isRead ? "bg-accent/5 -mx-3 px-3 rounded-lg" : ""}`}
								>
									<button
										type="button"
										aria-label={`View ${actor?.username ?? "user"} profile`}
										data-testid={`notif-avatar-${n.id}`}
										onClick={(e) => openActor(n, e)}
										disabled={!actor}
										className="relative shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-default"
									>
										{avatar ? (
											<img
												src={avatar}
												alt=""
												className="h-12 w-12 rounded-xl object-cover"
											/>
										) : (
											<div className="h-12 w-12 rounded-xl bg-secondary" />
										)}
										<span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-background flex items-center justify-center">
											<Icon
												size={12}
												strokeWidth={2}
												className={
													n.type === "LIKE" ? "text-accent" : "text-foreground"
												}
											/>
										</span>
										{!n.isRead && (
											<span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent border-2 border-background" />
										)}
									</button>
									<div className="flex-1 min-w-0">
										<p className="text-[15px] leading-snug">
											<button
												type="button"
												data-testid={`notif-actor-${n.id}`}
												onClick={(e) => openActor(n, e)}
												disabled={!actor}
												className="font-display font-semibold tracking-tight hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded disabled:no-underline disabled:cursor-default text-left"
											>
												{actor?.name ?? "Someone"}
											</button>{" "}
											<span className="text-muted-foreground">
												{textFor(n)}
											</span>
										</p>
										<p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
											<TimeAgo iso={n.createdAt} />
										</p>
									</div>
									{renderActions(n)}
								</div>
							);
						})}
					</div>
				)}

				{hasNextPage && (
					<div className="mt-8 flex justify-center">
						<button
							type="button"
							data-testid="notifications-load-more"
							onClick={() => fetchNextPage()}
							disabled={isFetchingNextPage}
							className="px-6 h-11 rounded-full border border-border font-semibold text-sm hover:border-foreground transition-colors duration-200 disabled:opacity-40"
						>
							{isFetchingNextPage ? "Loading..." : "Load more"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

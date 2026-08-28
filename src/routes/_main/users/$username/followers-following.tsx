import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FollowList } from "#/components/FollowList.tsx";
import { userProfileQueryOptions } from "#/lib/users/users.hooks.ts";

export const Route = createFileRoute(
	"/_main/users/$username/followers-following",
)({
	validateSearch: (search) => ({
		tab: search.tab === "following" ? "following" : "followers",
	}),
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(
			userProfileQueryOptions(params.username),
		),
});

function FollowersFollowingPage() {
	const { username } = Route.useParams();
	const {
		data: user,
		isLoading,
		isError,
	} = useQuery(userProfileQueryOptions(username));
	const search = Route.useSearch();
	const navigate = Route.useNavigate();

	const tabs = [
		{ id: "followers" as const, label: "Followers" },
		{ id: "following" as const, label: "Following" },
	];

	const activeTab = search.tab as "followers" | "following";

	const switchTab = (tab: "followers" | "following") => {
		navigate({ search: (prev) => ({ ...prev, tab }), replace: true });
	};

	if (isLoading) {
		return (
			<div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-16">
				<div className="max-w-4xl mx-auto">
					<div className="h-36 w-36 rounded-3xl bg-secondary animate-pulse" />
				</div>
			</div>
		);
	}

	if (isError || !user) {
		return (
			<div className="px-4 sm:px-6 lg:px-10 pt-24">
				<div className="max-w-4xl mx-auto text-center">
					<p className="overline text-muted-foreground">Not found</p>
					<p className="font-display text-3xl tracking-tight mt-2">
						This account doesn't exist
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

	if (user.isPrivate && !user.isOwnProfile && !user.isFollowing) {
		return (
			<div className="px-4 sm:px-6 lg:px-10 pt-24">
				<div className="max-w-4xl mx-auto text-center">
					<p className="overline text-muted-foreground">Private account</p>
					<p className="font-display text-3xl tracking-tight mt-2">
						Follow this account to see their followers and following
					</p>
					<Link
						to={`/users/${username}`}
						className="mt-6 inline-block text-sm font-semibold text-accent hover:underline"
					>
						Back to profile
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-16">
				<div className="max-w-4xl mx-auto">
					{/* Header with user info */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
						<div className="flex items-center gap-3">
							{user.avatarUrl ? (
								<img
									src={user.avatarUrl}
									alt=""
									className="h-16 w-16 rounded-2xl object-cover"
								/>
							) : (
								<div className="h-16 w-16 rounded-2xl bg-secondary" />
							)}
							<div>
								<h1 className="font-display font-bold text-2xl tracking-tight">
									{user.name}
								</h1>
								<p className="text-muted-foreground">@{user.username}</p>
							</div>
						</div>
					</div>

					{/* Tab Navigation */}
					<div className="border-b border-border mb-6">
						<div
							className="flex gap-2 overflow-x-auto no-scrollbar"
							role="tablist"
						>
							{tabs.map((tab) => (
								<button
									type="button"
									key={tab.id}
									role="tab"
									aria-selected={activeTab === tab.id}
									onClick={() => switchTab(tab.id)}
									className={`relative px-4 py-3 text-sm font-display font-semibold tracking-tight transition-colors duration-200 whitespace-nowrap ${
										activeTab === tab.id
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									{tab.label}
									{activeTab === tab.id && (
										<span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-accent" />
									)}
								</button>
							))}
						</div>
					</div>

					{/* Content */}
					<FollowList
						username={username}
						type={activeTab}
						isOwnProfile={user.isOwnProfile}
					/>
				</div>
			</div>
		</div>
	);
}

export default FollowersFollowingPage;

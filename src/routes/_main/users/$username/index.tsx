import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UserProfileView } from "#/components/UserProfileView.tsx";
import { userProfileQueryOptions } from "#/lib/users/users.hooks.ts";

export const Route = createFileRoute("/_main/users/$username/")({
  component: UserProfilePage,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      userProfileQueryOptions(params.username),
    ),
});

function UserProfilePage() {
  const { username } = Route.useParams();
  const { data: user, isLoading, isError } = useQuery(
    userProfileQueryOptions(username),
  );

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 pt-10 sm:pt-16">
        <div className="max-w-4xl mx-auto">
          <div className="h-36 w-36 rounded-3xl bg-secondary animate-pulse" />
          <div className="mt-6 h-8 w-48 rounded bg-secondary animate-pulse" />
          <div className="mt-3 h-4 w-32 rounded bg-secondary animate-pulse" />
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
            This account doesn’t exist
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

  return <UserProfileView user={user} isSelf={false} />;
}

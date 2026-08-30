import { createFileRoute } from "@tanstack/react-router";
import { UserProfileView } from "#/components/UserProfileView.tsx";

export const Route = createFileRoute("/_main/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  return <UserProfileView user={user} isSelf />;
}

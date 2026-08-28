import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/profile/edit/")({
  component: EditPage,
});

function EditPage() {
  return <div>Hello "/_main/profile/edit-profile/"!</div>;
}

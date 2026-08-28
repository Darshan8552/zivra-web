import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/chat/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/chat/"!</div>
}

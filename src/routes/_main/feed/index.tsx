import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/feed/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/feed/"!</div>
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/search/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/search/"!</div>
}

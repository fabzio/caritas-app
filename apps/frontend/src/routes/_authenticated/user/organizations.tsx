import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/user/organizations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/user/organizations"!</div>
}

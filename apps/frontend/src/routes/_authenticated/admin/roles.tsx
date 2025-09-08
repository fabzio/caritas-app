import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin/roles')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/admin/roles"!</div>
}

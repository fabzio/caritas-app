import OrganizationDashboard from '@frontend/modules/organization/dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <OrganizationDashboard />
}

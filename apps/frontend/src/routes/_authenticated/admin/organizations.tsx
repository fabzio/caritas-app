import { createFileRoute } from '@tanstack/react-router'
import { QueryKeys } from '@/shared/constants/query-keys'

export const Route = createFileRoute('/_authenticated/admin/organizations')({
  loader: async ({ context: { authClient, queryClient } }) => {
    queryClient.ensureQueryData({
      queryKey: [QueryKeys.ADMIN.ORGANIZATION],
      queryFn: async () => {
        const { data, error } =
          await authClient.organization.getFullOrganization()
        if (error) throw error
        return data
      },
    })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/admin/organizations"!</div>
}

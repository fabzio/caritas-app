import { createFileRoute } from '@tanstack/react-router'
import ViewOrganizations from '@/modules/health/pages/allies/view'
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
  component: ViewOrganizations,
})

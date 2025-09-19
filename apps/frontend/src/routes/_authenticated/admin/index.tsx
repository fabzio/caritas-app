import { createFileRoute } from '@tanstack/react-router'
import Dashboard from '@/modules/admin/pages/dashboard'
import { QueryKeys } from '@/shared/constants/query-keys'

export const Route = createFileRoute('/_authenticated/admin/')({
  loader: async ({ context: { authClient, queryClient } }) => {
    await queryClient.ensureQueryData({
      queryKey: [QueryKeys.ADMIN.ORGANIZATION],
      queryFn: async () => {
        const { data, error } =
          await authClient.organization.getFullOrganization()
        if (error) throw error
        return data
      },
    })
  },
  component: Dashboard,
})

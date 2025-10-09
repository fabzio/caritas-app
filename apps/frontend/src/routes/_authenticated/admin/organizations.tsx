import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'

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
  component: () => 'tbd',
})

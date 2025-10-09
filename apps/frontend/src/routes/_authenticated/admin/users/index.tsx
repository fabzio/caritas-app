import rpc from '@frontend/lib/rpc'
import TableView from '@frontend/modules/admin/pages/users'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'

export type UsersFilters = Filters & {
  role?: string
}

export const Route = createFileRoute('/_authenticated/admin/users/')({
  loader: async ({ context: { queryClient, authClient } }) => {
    const { data } = await authClient.getSession()
    if (!data) return
    const {
      session: { activeOrganizationId },
    } = data
    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.ADMIN.USERS],
      queryFn: async () => {
        const { data, error } = await rpc.admin.users.get({
          query: {
            organizationId: activeOrganizationId || '',
          },
        })
        if (error) throw error
        return data || { members: [], total: 0 }
      },
    })
  },
  validateSearch: () => ({}) as UsersFilters,
  component: TableView,
})

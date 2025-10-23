import rpc from '@frontend/lib/rpc'
import OrganizationTableView from '@frontend/modules/education/pages/allies'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/education/organization/')(
  {
    loader: async ({ context: { queryClient } }) => {
      queryClient.ensureQueryData({
        queryKey: [QueryKeys.ORGANIZATIONS],
        queryFn: async () => {
          const { data, error } = await rpc.admin.organization.get()
          if (error) throw error
          return data
        },
      })
    },
    validateSearch: () => ({}) as Filters,
    component: OrganizationTableView,
  },
)

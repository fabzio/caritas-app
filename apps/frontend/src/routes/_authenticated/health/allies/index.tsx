import rpc from '@frontend/lib/rpc'
import AlliesTableView from '@frontend/modules/health/pages/allies'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/health/allies/')({
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
  component: AlliesTableView,
})

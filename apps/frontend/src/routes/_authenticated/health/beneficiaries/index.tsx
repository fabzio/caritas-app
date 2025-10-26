import rpc from '@frontend/lib/rpc'
import TableView from '@frontend/modules/health/pages/beneficiaries'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'

export type BeneficiariesFilters = Filters

export const Route = createFileRoute('/_authenticated/health/beneficiaries/')({
  loader: async ({ context: { queryClient } }) => {
    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.HEALTH.BENEFICIARIES],
      queryFn: async () => {
        const { data, error } = await rpc.health.beneficiaries.get({
          query: {},
        })
        if (error) throw error
        return data || { data: [], total: 0, page: 0, limit: 10, totalPages: 0 }
      },
    })
  },
  validateSearch: () => ({}) as BeneficiariesFilters,
  component: TableView,
})

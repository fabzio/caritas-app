import rpc from '@frontend/lib/rpc'
import ActivityPage from '@frontend/modules/health/pages/activities'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'

export type ActivitySearchSchema = Filters & {
  selectFilters?: {
    startDate: string
    endDate: string
  }
}

export const Route = createFileRoute('/_authenticated/health/activities/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData({
      queryKey: [QueryKeys.HEALTH.ACTIVITIES, {}],

      queryFn: async () => {
        const { data, error } = await rpc.health.activities.get({
          query: {
            pageSize: 10,
            pageIndex: 0,
            sortBy: 'name.asc',
            selectFilters: {
              startDate: '',
              endDate: '',
            },
          },
        })

        if (error) throw error
        return (
          data || {
            data: [],
            total: 0,
            pageIndex: 0,
            totalPages: 1,
            pageSize: 10,
          }
        )
      },
    }),

  validateSearch: () => ({}) as ActivitySearchSchema,
  component: ActivityPage,
})

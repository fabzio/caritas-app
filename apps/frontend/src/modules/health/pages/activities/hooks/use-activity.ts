import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { Filters } from '@frontend/shared/types/filters'
import { useQuery } from '@tanstack/react-query'

type UseActivitiesParams = {
  currentPage?: number
  pageSize?: number
  filters?: Omit<Filters, 'page' | 'limit'> & {
    pageIndex?: number
    pageSize?: number
  }
}

export const useActivities = ({
  currentPage = 1,
  pageSize = 10,
  filters,
}: UseActivitiesParams) => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ACTIVITIES, filters],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.get({
        query: {
          q: filters?.q || '',
          page: Math.max(0, (currentPage || 1) - 1),
          limit: pageSize,
          sortBy: filters?.sortBy || 'name.asc',
          regionIds: filters?.regionIds,
          startDate: filters?.startDate,
          endDate: filters?.endDate,
        },
      })

      if (error) throw error
      return data
    },
  })
}

export type ActivityResponse = NonNullable<
  ReturnType<typeof useActivities>['data']
>

export type Activity = ActivityResponse['data'][number]

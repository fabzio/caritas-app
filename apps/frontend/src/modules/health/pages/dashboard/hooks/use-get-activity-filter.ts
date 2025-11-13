import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export const useGetActivityFilter = () => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ANALITICS.FILTERS],
    queryFn: async () => {
      const { data, error } =
        await rpc.health.analytics.filters.activities.get()
      if (error) throw error
      return data
    },
  })
}

import { useFilters } from '@frontend/hooks/use-filters'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export const useUserActivities = () => {
  const { filters } = useFilters('/_authenticated/user/health/activities/')
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ACTIVITIES, filters],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.get({
        query: {
          user: filters.view || 'active',
        },
      })
      if (error) throw error
      return data
    },
  })
}

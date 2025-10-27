import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export const useActivityRegions = () => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ACTIVITY_REGIONS],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.regions.get()

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

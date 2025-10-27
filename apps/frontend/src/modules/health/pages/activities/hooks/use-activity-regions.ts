import rpc from '@frontend/lib/rpc'
import { useQuery } from '@tanstack/react-query'

export const useActivityRegions = () => {
  return useQuery({
    queryKey: ['health-activity-regions'],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.regions.get()

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5,
  })
}

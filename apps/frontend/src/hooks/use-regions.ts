import rpc from '@frontend/lib/rpc'
import { useQuery } from '@tanstack/react-query'

export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const res = await rpc.regions.get()
      if (res.error) throw res.error
      return res.data
    },
  })
}

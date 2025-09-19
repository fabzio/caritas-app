import { useQuery } from '@tanstack/react-query'
import rpc from '@/lib/rpc'

export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const res = await rpc.auth.regions.get()
      return res.data
    },
  })
}

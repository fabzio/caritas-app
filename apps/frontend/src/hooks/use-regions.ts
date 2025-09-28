import { useQuery } from '@tanstack/react-query'
import rpc from '@/lib/rpc'

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

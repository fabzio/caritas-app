import rpc from '@frontend/lib/rpc'
import { useQuery } from '@tanstack/react-query'

export const useActivityById = (id: string) => {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities[id].get()

      if (error) {
        throw new Error(error.value as string)
      }

      return data
    },
    enabled: !!id,
  })
}

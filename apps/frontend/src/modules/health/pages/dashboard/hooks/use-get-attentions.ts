import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export const useGetAttentions = () => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ANALITICS.GENERAL],
    queryFn: async () => {
      const { data, error } = await rpc.health.analytics.attentions.get()
      if (error) throw error
      return data
    },
  })
}

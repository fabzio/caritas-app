import { useSuspenseQuery } from '@tanstack/react-query'
import rpc from '@/lib/rpc'
import { QueryKeys } from '@/shared/constants/query-keys'

export const useHealthOrganization = () => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.ADMIN.HEALTH_ORGANIZATION],
    queryFn: async () => {
      const res = await rpc.health['health-organization'].get()
      if (res.error) throw res.error
      return res.data
    },
  })
}

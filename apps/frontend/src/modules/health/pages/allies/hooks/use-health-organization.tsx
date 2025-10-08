import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

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

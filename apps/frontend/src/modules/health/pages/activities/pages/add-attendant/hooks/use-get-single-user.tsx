import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

export const useAttendantDetail = (id?: string) => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.HEALTH.ADD_ATTENDANT, id || ''],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await rpc.health.activities
        .attendant({ id })
        .get()
      if (error) throw error
      return data || null
    },
  })
}

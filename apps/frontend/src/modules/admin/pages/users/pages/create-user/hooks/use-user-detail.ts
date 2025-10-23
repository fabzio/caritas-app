import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

export const useUserDetail = (id?: string) => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.ADMIN.USERS, id || ''],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await rpc.admin.users({ id }).get()
      if (error) throw error
      return data || null
    },
  })
}

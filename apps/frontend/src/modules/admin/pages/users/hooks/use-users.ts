import { useSuspenseQuery } from '@tanstack/react-query'
import authClient from '@/lib/authClient'
import { QueryKeys } from '@/shared/constants/query-keys'

export const useUsers = ({ currentPage = 1, pageSize = 10 }) => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.ADMIN.USERS],
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit: pageSize,
          offset: (currentPage - 1) * pageSize || 0,
        },
      })
      if (error) throw error
      return data
    },
  })
}
export type User = ReturnType<typeof useUsers>['data']['users'][number]

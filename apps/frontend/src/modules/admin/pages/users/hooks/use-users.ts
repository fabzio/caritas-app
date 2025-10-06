import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

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

import { useSuspenseQuery } from '@tanstack/react-query'
import authClient from '@/lib/authClient'
import { QueryKeys } from '@/shared/constants/query-keys'

export const useUsers = ({ currentPage = 1, pageSize = 10 }) => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.ADMIN.MEMBERS],
    queryFn: async () => {
      const { data, error } = await authClient.organization.listMembers({
        query: {
          limit: pageSize,
          offset: (currentPage - 1) * pageSize || 0,
        },
      })
      if (error) throw error
      return data || { members: [], total: 0 }
    },
  })
}
export type Member = ReturnType<typeof useUsers>['data']['members'][number]

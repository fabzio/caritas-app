import { useQuery } from '@tanstack/react-query'
import authClient from '@/lib/authClient'
import { QueryKeys } from '@/shared/constants/query-keys'
import type { Filters } from '@/shared/types/filters'

type UseUsersParams = {
  currentPage?: number
  pageSize?: number
  filters?: Filters
}

export const useUsers = ({
  currentPage = 1,
  pageSize = 10,
  filters,
}: UseUsersParams) => {
  return useQuery({
    queryKey: [QueryKeys.ADMIN.USERS, filters],
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          searchValue: filters?.q || '',
          searchField: 'name',
          searchOperation: 'contains',
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

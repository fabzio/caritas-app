import { useQuery } from '@tanstack/react-query'
import rpc from '@/lib/rpc'
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
      const { data, error } = await rpc.users.get({
        query: {
          q: filters?.q || '',
          page: currentPage - 1 || 0,
          limit: pageSize,
          sortBy: filters?.sortBy || 'name.asc',
        },
      })
      console.log(data)
      if (error) throw error
      return data
    },
  })
}

export type User = NonNullable<ReturnType<typeof useUsers>['data']>[number]

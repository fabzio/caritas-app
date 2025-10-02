import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { Filters } from '@frontend/shared/types/filters'
import { useQuery } from '@tanstack/react-query'

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

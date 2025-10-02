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
          page: Math.max(0, (currentPage || 1) - 1),
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

export type UsersResponse = NonNullable<ReturnType<typeof useUsers>['data']>
export type User = UsersResponse['data'][number]

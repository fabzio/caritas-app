import { useSession } from '@frontend/hooks/use-session'
import rpc from '@frontend/lib/rpc'
import type { UsersFilters } from '@frontend/routes/_authenticated/admin/users'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

type UseUsersParams = {
  currentPage?: number
  pageSize?: number
  filters?: UsersFilters
}

export const useListUsers = ({
  currentPage = 1,
  pageSize = 10,
  filters,
}: UseUsersParams) => {
  const { data: user } = useSession()
  return useQuery({
    queryKey: [QueryKeys.ADMIN.USERS, filters],
    queryFn: async () => {
      const { data, error } = await rpc.admin.users.get({
        query: {
          organizationId: user?.session.activeOrganizationId || '',
          q: filters?.q || '',
          role: filters?.role,
          page: Math.max(0, (currentPage || 1) - 1),
          limit: pageSize,
          sortBy: filters?.sortBy || 'name.asc',
        },
      })
      if (error) throw error
      return data
    },
  })
}

export type UsersResponse = NonNullable<ReturnType<typeof useListUsers>['data']>
export type User = UsersResponse['data'][number]

import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { Filters } from '@frontend/shared/types/filters'
import { useQuery } from '@tanstack/react-query'

type UseParams = {
  currentPage?: number
  pageSize?: number
  filters?: Filters
}

export const useListOrganizations = ({
  currentPage = 1,
  pageSize = 10,
  filters,
}: UseParams) => {
  return useQuery({
    queryKey: [QueryKeys.ADMIN.ALLIES, filters],
    queryFn: async () => {
      const { data, error } = await rpc.admin.organization.get({
        query: {
          q: filters?.q || '',
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

export type OrganizationResponse = NonNullable<
  ReturnType<typeof useListOrganizations>['data']
>
export type Organization = OrganizationResponse['data'][number]

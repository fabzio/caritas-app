import { useSession } from '@frontend/hooks/use-session'
import rpc from '@frontend/lib/rpc'
import type { SpecialitiesFilters } from '@frontend/routes/_authenticated/health/specialities'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

type UseGetSpecialitiesParams = {
  currentPage?: number
  pageSize?: number
  filters?: SpecialitiesFilters
}

export const useGetSpecialities = ({
  currentPage = 1,
  pageSize = 10,
  filters,
}: UseGetSpecialitiesParams) => {
  const { data: speciality } = useSession()
  return useQuery({
    queryKey: [QueryKeys.HEALTH.SPECIALITIES, filters],
    queryFn: async () => {
      const { data, error } = await rpc.health.speciality.get({
        query: {
          organizationId: speciality?.session.activeOrganizationId || '',
          q: filters?.q || '',
          search: filters?.search,
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

export type SpecialitiesResponse = NonNullable<
  ReturnType<typeof useGetSpecialities>['data']
>

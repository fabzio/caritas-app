import { useSession } from '@frontend/hooks/use-session'
import rpc from '@frontend/lib/rpc'
import type { SpecialitiesFilters } from '@frontend/routes/_authenticated/health/specialities'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

type UseSpecialitiesParams = {
  currentPage?: number
  pageSize?: number
  filters?: SpecialitiesFilters
}

export const useListSpecialities = ({
  currentPage = 1,
  pageSize = 10,
  filters,
}: UseSpecialitiesParams) => {
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
  ReturnType<typeof useListSpecialities>['data']
>
export type Speciality = SpecialitiesResponse['data'][number]

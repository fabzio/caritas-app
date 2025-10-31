import rpc from '@frontend/lib/rpc'
import type { BeneficiariesFilters } from '@frontend/routes/_authenticated/health/beneficiaries'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

type UseBeneficiariesParams = {
  currentPage?: number
  pageSize?: number
  filters?: BeneficiariesFilters
}

export const useListBeneficiaries = ({
  currentPage = 1,
  pageSize = 10,
  filters,
}: UseBeneficiariesParams) => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.BENEFICIARIES, filters],
    queryFn: async () => {
      const { data, error } = await rpc.health.beneficiaries.get({
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

export type BeneficiariesResponse = NonNullable<
  ReturnType<typeof useListBeneficiaries>['data']
>
export type Beneficiary = BeneficiariesResponse['data'][number]

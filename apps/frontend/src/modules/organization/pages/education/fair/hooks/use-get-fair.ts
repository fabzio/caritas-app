import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

type GetFairsParams = {
  currentPage?: number
  pageSize?: number
  filters?: {
    q?: string
    district?: string
    date?: string
    status?: string
    sortBy?: string
    pageIndex?: number
    pageSize?: number
  }
}

export const useGetFairs = ({
  currentPage = 1,
  pageSize = 10,
  filters,
}: GetFairsParams) => {
  return useQuery({
    queryKey: [QueryKeys.EDUCATION.FAIR, filters],
    queryFn: async () => {
      const response = await rpc.education.fairs.get({
        query: {
          page: Math.max(0, (currentPage || 1) - 1),
          limit: pageSize,
          q: filters?.q,
          district: filters?.district,
          date: filters?.date,
          status: filters?.status,
          sortBy: filters?.sortBy,
        },
      })

      if (response.error) {
        throw new Error(
          typeof response.error.value === 'string'
            ? response.error.value
            : 'Error al obtener las ferias',
        )
      }

      return response.data
    },
  })
}

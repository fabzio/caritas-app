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
    queryKey: [QueryKeys.EDUCATION.FAIR, currentPage, pageSize, filters],
    queryFn: async () => {
      const response = await rpc.education.fairs.index.get({
        query: {
          page: currentPage - 1,
          limit: pageSize,
          q: filters?.q,
          district: filters?.district,
          date: filters?.date,
          sortBy: filters?.sortBy,
        },
      })

      if (response.error) {
        throw new Error(response.error.value as string)
      }

      return response.data
    },
  })
}

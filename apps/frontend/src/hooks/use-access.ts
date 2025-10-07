import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { AccessMatrix } from '@frontend/shared/types/access'
import { useQuery } from '@tanstack/react-query'

export const useAccess = () => {
  const { isLoading, data } = useQuery<AccessMatrix>({
    queryKey: [QueryKeys.ACCESS],
    queryFn: async () => {
      const response = await rpc.auth.access.get()
      if (response.error) throw response.error
      if (!response.data) throw new Error('Missing access permissions')
      return response.data as AccessMatrix
    },
    staleTime: Infinity,
  })
  return {
    isLoading,
    data,
  }
}

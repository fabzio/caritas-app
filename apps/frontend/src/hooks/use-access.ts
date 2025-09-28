import { useQuery } from '@tanstack/react-query'
import rpc from '@/lib/rpc'
import { QueryKeys } from '@/shared/constants/query-keys'
import type { AccessMatrix } from '@/shared/types/access'

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

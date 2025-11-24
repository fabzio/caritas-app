import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export const useFairStatus = () => {
  return useQuery({
    queryKey: [QueryKeys.EDUCATION.FAIR, 'status'],
    queryFn: async () => {
      const response = await rpc.education.fairs.status.get()

      if (response.error) {
        throw new Error(response.error.value as string)
      }

      return response.data
    },
  })
}

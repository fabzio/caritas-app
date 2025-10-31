import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export default function useGetSpeciality(id?: number) {
  return useQuery({
    enabled: !!id,
    queryKey: [QueryKeys.HEALTH.SPECIALITIES, id],
    queryFn: async () => {
      if (!id) return undefined
      const { data, error } = await rpc.health.speciality({ id }).get()
      if (error) throw error
      return data
    },
  })
}

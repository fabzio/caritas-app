import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export const useSpecialities = (search = '') => {
  return useQuery({
    queryKey: [QueryKeys.SPECIALITY, search],
    queryFn: async () => {
      const { data, error } = await rpc.health.speciality.get({
        query: { search },
      })
      if (error) throw error
      return data
    },
    initialData: [],
    placeholderData: (previousData) => previousData,
  })
}

export type Speciality = ReturnType<typeof useSpecialities>['data'][number]

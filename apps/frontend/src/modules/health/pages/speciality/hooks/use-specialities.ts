import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

export const useSpecialities = () => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.SPECIALITY],
    queryFn: async () => {
      const { data, error } = await rpc.health.speciality.get()
      if (error) throw error
      return data
    },
  })
}

export type Speciality = ReturnType<typeof useSpecialities>['data'][number]

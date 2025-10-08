import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

//Hook to fetch all specialities
const useGetSpeciality = () => {
  return useQuery({
    queryKey: [QueryKeys.SPECIALITY],
    queryFn: async () => {
      const res = await rpc.health.speciality.get()
      if (res.error) throw res.error
      return res.data
    },
  })
}
export default useGetSpeciality

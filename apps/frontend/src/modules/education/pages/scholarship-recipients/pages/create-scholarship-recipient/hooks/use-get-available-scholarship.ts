import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export type AvailableScholarships = NonNullable<
  Awaited<ReturnType<typeof rpc.education.scholarship.available.get>>
>['data']

const useGetAvailableScholarship = () => {
  return useQuery({
    queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP, 'available'],
    queryFn: async () => {
      const res = await rpc.education.scholarship.available.get()
      if (res.error) throw res.error
      return res
    },
  })
}

export default useGetAvailableScholarship

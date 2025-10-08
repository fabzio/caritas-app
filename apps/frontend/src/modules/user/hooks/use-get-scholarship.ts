import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

//Hook to fech all scholarships
const useGetScholarship = () => {
  return useQuery({
    queryKey: [QueryKeys.SCHOLARSHIP],
    queryFn: async () => {
      const res = await rpc.education.scholarship.get()
      if (res.error) throw res.error
      return res.data
    },
  })
}
export default useGetScholarship

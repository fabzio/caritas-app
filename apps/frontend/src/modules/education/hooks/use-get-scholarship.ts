import { useQuery } from '@tanstack/react-query'
import rpc from '@/lib/rpc'
import { QueryKeys } from '@/shared/constants/query-keys'

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

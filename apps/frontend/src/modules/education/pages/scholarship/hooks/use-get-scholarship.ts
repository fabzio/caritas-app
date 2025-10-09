import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

const useGetScholarship = () => {
  return useQuery({
    queryKey: [QueryKeys.SCHOLARSHIP, { name, page, pageSize }],
    queryFn: async () => {
      const res = await rpc.education.scholarship.get({
        query: { name, page, pageSize },
      })
      if (res.error) throw res.error
      return res.data // { data, page, pageSize, total, pageCount, hasNext }
    },
    // keepPreviousData: true, //
  })
}
export default useGetScholarship

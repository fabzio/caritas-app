import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

// hook para hacer fech all de scholarships
// tiene filtrado por nombre y paginación
const useGetScholarship = (name?: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [QueryKeys.SCHOLARSHIP, { name, page, pageSize }],
    queryFn: async () => {
      const res = await rpc.education.scholarship.get({
        query: { name, page, pageSize },
      })
      if (res.error) throw res.error
      return res.data
    },
    // keepPreviousData: true, //
  })
}
export default useGetScholarship

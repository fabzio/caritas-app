import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

const useGetOrganization = () => {
  return useQuery({
    queryKey: [QueryKeys.ADMIN.ALLIES],
    queryFn: async () => {
      const res = await rpc.education.organization.get({
        query: { active: true },
      })
      if (res.error) throw res.error
      return res.data?.data
    },
  })
}
export default useGetOrganization

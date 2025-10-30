import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

const useGetOrganization = () => {
  return useQuery({
    queryKey: [QueryKeys.ORGANIZATIONS],
    queryFn: async () => {
      const res = await rpc.education.organization.get()
      if (res.error) throw res.error
      return res.data
    },
  })
}
export default useGetOrganization

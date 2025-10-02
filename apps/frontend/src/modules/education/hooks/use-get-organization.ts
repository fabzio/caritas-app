import { useQuery } from '@tanstack/react-query'
import rpc from '@/lib/rpc'
import { QueryKeys } from '@/shared/constants/query-keys'

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

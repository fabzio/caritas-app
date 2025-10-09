import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

const useGetOrganizationMajor = () => {
  return useQuery({
    queryKey: [QueryKeys.ORGANIZATIONSMAJOR],
    queryFn: async () => {
      const res = await rpc.education.organizationMajor.get()
      if (res.error) throw res.error
      return res.data
    },
  })
}
export default useGetOrganizationMajor

import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export default function useGetOrganization(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: [QueryKeys.EDUCATION.ORGANIZATIONS, id],
    queryFn: async () => {
      if (!id) return undefined
      const { data, error } = await rpc.admin.organization({ id }).get()
      if (error) throw error
      return data
    },
  })
}

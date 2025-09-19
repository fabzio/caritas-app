import { useSuspenseQuery } from '@tanstack/react-query'
import authClient from '@/lib/authClient'
import { QueryKeys } from '@/shared/constants/query-keys'

export const useOrganization = () => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.ADMIN.ORGANIZATION],
    queryFn: async () => {
      const { data, error } =
        await authClient.organization.getFullOrganization()
      if (error) throw error
      return data
    },
  })
}

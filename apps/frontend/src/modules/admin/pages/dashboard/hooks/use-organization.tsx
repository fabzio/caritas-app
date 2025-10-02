import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

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

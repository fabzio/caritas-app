import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

export const useLinkedAccounts = () => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.SETTINGS.ACCOUNTS],
    queryFn: async () => {
      const { data, error } = await authClient.listAccounts()
      if (error) throw error
      return data
    },
  })
}

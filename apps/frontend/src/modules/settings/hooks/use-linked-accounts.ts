import { useSuspenseQuery } from '@tanstack/react-query'
import authClient from '@/lib/authClient'
import { QueryKeys } from '@/shared/constants/query-keys'

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

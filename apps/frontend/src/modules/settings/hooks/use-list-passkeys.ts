import { useSuspenseQuery } from '@tanstack/react-query'
import authClient from '@/lib/authClient'
import { QueryKeys } from '@/shared/constants/query-keys'

export const useListPasskeys = () => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.SETTINGS.PASSKEYS],
    queryFn: async () => {
      const { data, error } = await authClient.passkey.listUserPasskeys()
      if (error) throw error
      return data
    },
  })
}

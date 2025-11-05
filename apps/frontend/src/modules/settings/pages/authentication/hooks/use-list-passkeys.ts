import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

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

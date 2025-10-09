import Authentication from '@frontend/modules/settings/pages/authentication'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings/authentication')(
  {
    loader: async ({ context: { queryClient, authClient } }) => {
      await Promise.all([
        queryClient.ensureQueryData({
          queryKey: [QueryKeys.SETTINGS.ACCOUNTS],
          queryFn: async () => {
            const { data, error } = await authClient.listAccounts()
            if (error) throw error
            return data
          },
        }),
        queryClient.ensureQueryData({
          queryKey: [QueryKeys.SETTINGS.PASSKEYS],
          queryFn: async () => {
            const { data, error } = await authClient.passkey.listUserPasskeys()
            if (error) throw error
            return data
          },
        }),
      ])
    },
    component: Authentication,
  },
)

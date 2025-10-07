import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { AccessMatrix } from '@frontend/shared/types/access'
import { redirectByProperties } from '@frontend/shared/utils/redirect-by-properties'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context: { queryClient, authClient } }) => {
    const { data } = await queryClient.fetchQuery({
      queryKey: [QueryKeys.SESSION],
      queryFn: () => authClient.getSession(),
    })
    if (!data) throw redirect({ to: '/auth/login', search: { redirect: '/' } })

    const [access, organizations] = await Promise.all([
      queryClient
        .fetchQuery<AccessMatrix>({
          queryKey: [QueryKeys.ACCESS],
          queryFn: async () => {
            const response = await rpc.auth.access.get()
            if (response.error) throw response.error
            if (!response.data) throw new Error('Missing access permissions')
            return response.data as AccessMatrix
          },
          staleTime: Infinity,
        })
        .catch(() => null),
      queryClient
        .fetchQuery<Array<{ type?: string }>>({
          queryKey: [QueryKeys.ORGANIZATIONS],
          queryFn: async () => {
            const { data: orgData, error } =
              await authClient.organization.list()
            if (error) throw error
            return orgData ?? []
          },
        })
        .catch(() => []),
    ])

    const destination = redirectByProperties({
      role: data.user.role ?? null,
      access,
      hasOrganizations: organizations.length > 0,
    })

    throw redirect({ to: destination })
  },
})

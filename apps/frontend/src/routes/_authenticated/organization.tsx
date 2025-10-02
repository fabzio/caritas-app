import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/organization')({
  beforeLoad: async ({ context: { authClient, queryClient } }) => {
    const orgs = await queryClient.fetchQuery({
      queryKey: [QueryKeys.ORGANIZATIONS],
      queryFn: async () => {
        const { data, error } = await authClient.organization.list()
        if (error) throw error
        return data
      },
    })
    const haveAlliedOrg = orgs.filter(
      (org) => org.type === 'health' || org.type === 'education',
    )
    if (!haveAlliedOrg?.length)
      throw redirect({
        to: '/user',
      })
    await authClient.organization.setActive({
      organizationId: haveAlliedOrg?.[0]?.id,
    })
  },
})

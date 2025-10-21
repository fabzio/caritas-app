import rpc from '@frontend/lib/rpc'
import Invitations from '@frontend/modules/settings/pages/invitations'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/settings/invitations')({
  loader: async ({ context: { queryClient, authClient } }) =>
    await queryClient.ensureQueryData({
      queryKey: [QueryKeys.SETTINGS.INVITATIONS],
      queryFn: async () => {
        const { data, error } =
          await authClient.organization.listUserInvitations()
        if (error) throw error
        const [orgsData, inviterData] = await Promise.all([
          Promise.all(
            data.map((invitation) =>
              rpc
                .organizations({
                  id: invitation.organizationId,
                })
                .get()
                .then((res) => res.data),
            ),
          ),
          Promise.all(
            data.map((invitation) =>
              rpc
                .users({
                  id: invitation.inviterId,
                })
                .get()
                .then((res) => res.data),
            ),
          ),
        ])
        return data.map((invitation, index) => ({
          ...invitation,
          organization: orgsData[index],
          inviter: inviterData[index],
        }))
      },
    }),
  validateSearch: () =>
    ({}) as {
      id?: string
    },
  component: Invitations,
})

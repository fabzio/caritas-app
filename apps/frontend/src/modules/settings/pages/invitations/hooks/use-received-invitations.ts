import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

export const useReceivedInvitations = () => {
  return useSuspenseQuery({
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
    refetchOnMount: false,
  })
}

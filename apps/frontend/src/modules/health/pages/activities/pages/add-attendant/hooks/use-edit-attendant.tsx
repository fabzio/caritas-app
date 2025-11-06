import { useSession } from '@frontend/hooks/use-session'
import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type UpdateAttendantProps = Parameters<
  typeof authClient.admin.updateUser
>[0] & {
  teamIds?: string[]
  activityId: number
}

export const useUpdateAttendant = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  return useMutation({
    mutationFn: async (props: UpdateAttendantProps) => {
      const { teamIds, ...userPayload } = props
      const { data, error } = await authClient.admin.updateUser(userPayload)
      if (error) throw error
      if (teamIds && teamIds.length > 0)
        await rpc.admin
          .users({
            id: props.userId as string,
          })
          .patch({
            teamIds,
          })
      return data
    },
    onSuccess: (_, { userId, activityId }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADMIN.USERS] })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ADMIN.USERS, userId],
      })
      if (session?.user.id === userId)
        queryClient.invalidateQueries({ queryKey: [QueryKeys.ACCESS] })
      toast.success('Asistente modificado exitosamente')
      navigate({
        to: '/health/activities/$activityId/assistance',
        params: { activityId: activityId.toString() },
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

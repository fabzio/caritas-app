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
  insuranceType: 'none' | 'public' | 'private'
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
      // Check if insurance info exists, then update or create accordingly
      const { data: insuranceInfo } = await rpc.auth.info
        .patient({ userId: props.userId as string })
        .get()
      if (insuranceInfo) {
        const { error: patientError } = await rpc.auth.info
          .patient({ userId: props.userId as string })
          .patch({
            insuranceType: props.insuranceType,
          })
        if (patientError) throw patientError
      } else {
        const { error: patientError } = await rpc.auth.info.patient.post({
          userId: props.userId as string,
          insuranceType: props.insuranceType,
        })
        if (patientError) throw patientError
      }
      return data
    },
    onSuccess: (_, { userId, activityId }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADMIN.USERS] })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ADMIN.USERS, userId],
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.HEALTH.ACTIVITIES],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.HEALTH.ADD_ATTENDANT],
        refetchType: 'all',
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

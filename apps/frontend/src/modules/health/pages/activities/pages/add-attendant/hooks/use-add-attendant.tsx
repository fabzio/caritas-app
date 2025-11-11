import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type AddAttendantProps = Parameters<typeof authClient.admin.createUser>[0] & {
  activityId: number
}

export const useAddAttendant = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      props: AddAttendantProps & {
        insuranceType: 'none' | 'public' | 'private'
      },
    ) => {
      const { activityId, ...userPayload } = props
      const { data: userData, error: userError } =
        await authClient.admin.createUser(userPayload)
      if (userError) throw userError

      const { error: patientError } = await rpc.auth.info.patient.post({
        userId: userData.user.id,
        insuranceType: props.insuranceType,
      })
      if (patientError) throw patientError

      const { data: result, error: rpcError } = await rpc.health.activities[
        'add-attendant'
      ].post({
        userId: userData.user.id,
        activityId: activityId,
      })
      if (rpcError) throw rpcError
      return result
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.HEALTH.ADD_ATTENDANT],
      })
      toast.success('Asistente registrado exitosamente')
      navigate({
        to: '/health/activities/$activityId/assistance',
        params: { activityId: variables.activityId.toString() },
      })
    },
    onError: (error) => {
      toast.error(`Error al registrar asistente: ${error.message}`)
    },
  })
}

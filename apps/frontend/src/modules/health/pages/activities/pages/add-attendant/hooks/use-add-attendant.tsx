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
    mutationFn: async (props: AddAttendantProps) => {
      const { activityId, ...userPayload } = props
      const { data, error } = await authClient.admin.createUser(userPayload)
      if (error) throw error
      const { data: result, error: rpcError } = await rpc.health.activities[
        'add-attendant'
      ].post({
        userId: data.user.id,
        activityId: activityId,
      })
      if (rpcError) throw rpcError
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

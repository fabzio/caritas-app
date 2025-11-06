import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type AddExistentUserProps = {
  userId: string
  activityId: number
}

export const useAddExistentUser = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (props: AddExistentUserProps) => {
      const { error } = await rpc.health.activities['add-attendant'].post({
        userId: props.userId,
        activityId: props.activityId,
      })
      if (error) throw error
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

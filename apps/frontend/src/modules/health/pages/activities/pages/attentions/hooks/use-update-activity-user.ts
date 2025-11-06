import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type UpdateActivityUserProps = {
  userId: string
  activityId: number
  rewarded: boolean
}

export const useUpdateActivityUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: UpdateActivityUserProps) => {
      const { data, error } =
        await rpc.health.activities['user-rewarded'].patch(props)
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          QueryKeys.HEALTH.ACTIVITIES,
          variables.activityId.toString(),
        ],
      })
      queryClient.invalidateQueries({
        queryKey: [
          'user-attentions',
          variables.userId,
          variables.activityId.toString(),
        ],
      })
      toast.success('Incentivo marcado correctamente')
    },
    onError: () => {
      toast.error('Error al marcar el incentivo')
    },
  })
}

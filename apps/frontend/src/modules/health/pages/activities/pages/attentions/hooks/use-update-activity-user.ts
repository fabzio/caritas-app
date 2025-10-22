import rpc from '@frontend/lib/rpc'
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
          'activity-participant',
          variables.activityId.toString(),
          variables.userId,
        ],
      })
      toast.success('Incentivo marcado correctamente')
    },
    onError: () => {
      toast.error('Error al marcar el incentivo')
    },
  })
}

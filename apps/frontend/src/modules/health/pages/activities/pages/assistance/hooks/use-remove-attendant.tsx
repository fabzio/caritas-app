import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface RemoveAttendantProps {
  userId: string
  activityId: number
}

export const useRemoveAttendant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, activityId }: RemoveAttendantProps) => {
      const { data, error } = await rpc.health.activities[
        'remove-attendant'
      ].delete({
        userId: userId,
        activityId: activityId,
      })
      if (error) {
        throw new Error('Error desconocido al eliminar el asistente.')
      }
      return data
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          QueryKeys.HEALTH.ACTIVITIES,
          variables.activityId,
          variables.userId,
        ],
      })
    },
  })
}

import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

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

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.HEALTH.ACTIVITIES],
        refetchType: 'all',
      })
      toast.success('Asistente eliminado correctamente.')
    },
  })
}

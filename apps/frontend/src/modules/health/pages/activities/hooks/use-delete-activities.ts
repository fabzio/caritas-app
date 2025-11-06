import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useDeleteActivities = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const { data, error } = await rpc.health.activities.delete({
        ids,
      })

      if (error) throw error

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HEALTH.ACTIVITIES] })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.HEALTH.ACTIVITY_REGIONS],
      })
      toast.success(
        `${data.deletedCount} actividad${data.deletedCount === 1 ? '' : 'es'} eliminada${data.deletedCount === 1 ? '' : 's'} correctamente`,
      )
    },
    onError: (error) => {
      toast.error(`Error al eliminar actividades: ${error.message}`)
    },
  })
}

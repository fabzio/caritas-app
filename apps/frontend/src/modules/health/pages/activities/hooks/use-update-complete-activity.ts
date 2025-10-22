import rpc from '@frontend/lib/rpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type UpdateCompleteActivityInput = {
  name: string
  date: Date
  duration: string
  spaceId: string
  typeId: number
  statusId: number
  userId: string
  participants: {
    alliedId: string
    specialityIds: number[]
  }[]
}

export const useUpdateCompleteActivity = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateCompleteActivityInput) => {
      const { data, error } =
        await rpc.health.activities[id].complete.put(input)

      if (error) {
        const errorMessage =
          typeof error.value === 'string'
            ? error.value
            : error.value?.error || 'Error al actualizar la actividad'
        throw new Error(errorMessage)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-activities'] })
      queryClient.invalidateQueries({ queryKey: ['activity', id] })
      toast.success('Actividad actualizada exitosamente')
    },
    onError: (error: Error) => {
      console.error('Error completo:', error)
      toast.error(error.message || 'Error al actualizar la actividad')
    },
  })
}

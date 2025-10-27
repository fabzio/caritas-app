import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type CreateCompleteActivityInput = {
  name: string
  date: Date
  duration: string
  spaceId: string
  regionId: number
  address: string
  typeId: number
  statusId: number
  userId: string
  participants: {
    alliedId: string
    specialityIds: number[]
  }[]
}

export const useCreateCompleteActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCompleteActivityInput) => {
      const { data, error } = await rpc.health.activities.complete.post(input)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HEALTH.ACTIVITIES] })
      toast.success('Actividad creada exitosamente')
    },
    onError: (error: Error) => {
      console.error('Error completo:', error)
      toast.error(error.message || 'Error al crear la actividad')
    },
  })
}

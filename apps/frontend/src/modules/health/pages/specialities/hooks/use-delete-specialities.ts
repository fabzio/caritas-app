import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface DeleteSpecialitiesProps {
  ids: number[]
}

const useDeleteSpecialities = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: DeleteSpecialitiesProps) => {
      const { data, error } = await rpc.health.speciality.delete(props)

      if (error) throw error
      return data
    },
    onSuccess: (_) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.HEALTH.SPECIALITIES],
      })
      toast.success('Especialidad eliminada exitosamente')
    },
    onError: (error) => {
      toast.error(`Error al eliminar la especialidad: ${error.message}`)
    },
  })
}
export default useDeleteSpecialities

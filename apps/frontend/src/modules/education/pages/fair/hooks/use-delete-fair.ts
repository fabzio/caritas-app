import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface DeleteScholarshipsProps {
  ids: number[]
}
const useDeleteFairs = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (props: DeleteScholarshipsProps) => {
      const { data, error } = await rpc.education.fairs.delete(props)
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      const plural = variables.ids.length > 1 ? 's' : ''
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.FAIR],
      })
      toast.success(`Feria${plural} eliminada exitosamente`)
    },
    onError: (error, variables) => {
      const plural = variables.ids.length > 1 ? 's' : ''
      toast.error(
        `Error al eliminar la${plural} feria${plural}: ${error.message}`,
      )
    },
  })
}
export default useDeleteFairs

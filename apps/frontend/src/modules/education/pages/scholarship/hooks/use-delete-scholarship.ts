import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface DeleteScholarshipProps {
  ids: number[]
}
const useDeleteScholarships = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (props: DeleteScholarshipProps) => {
      console.log('estoy enviando estos ids', props)
      const { data, error } = await rpc.education.scholarship.delete(props)
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      const plural = variables.ids.length > 1 ? 's' : ''
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP],
      })
      toast.success(`Beca${plural} eliminada exitosamente`)
    },
    onError: (error, variables) => {
      const plural = variables.ids.length > 1 ? 's' : ''
      toast.error(
        `Error al eliminar la${plural} beca${plural}: ${error.message}`,
      )
    },
  })
}
export default useDeleteScholarships

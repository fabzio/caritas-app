import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface DeleteAlliesProps {
  ids: string[]
}

const useDeleteAllies = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: DeleteAlliesProps) => {
      const { data, error } = await rpc.admin.organization.delete(props)

      if (error) throw error
      return data
    },
    onSuccess: (_, props) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ADMIN.ALLIES],
      })
      toast.success(
        `Organizaci${props.ids.length > 0 ? 'ón ' : 'ones'} eliminada exitosamente`,
      )
    },
    onError: (error) => {
      toast.error(`Error al eliminar la organizaciones: ${error.message}`)
    },
  })
}
export default useDeleteAllies

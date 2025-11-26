import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface DeleteScholarshipsProps {
  ids: number[]
}
const IS_ONGOING_OR_ENDED_ERROR = 'IS_ONGOING_OR_ENDED'

const useDeleteFairs = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (props: DeleteScholarshipsProps) => {
      const { data, error } = await rpc.education.fairs.delete(props)
      if (error) {
        if (error.status === 409) {
          throw new Error(IS_ONGOING_OR_ENDED_ERROR, {
            cause: error.value,
          })
        }
        throw new Error((error.value as string) || 'Error al eliminar')
      }
      return data
    },
    onSuccess: (_, variables) => {
      const plural = variables.ids.length > 1 ? 's' : ''
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.FAIR],
      })
      toast.success(`Feria${plural} eliminada exitosamente`)
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message === IS_ONGOING_OR_ENDED_ERROR) {
          const errorData = error.cause as {
            fairsOngoingOrEnded: Array<{
              fairId: string
              fairName: string
              fairCount: number
            }>
          }

          const fair = errorData?.fairsOngoingOrEnded

          if (fair?.length > 0) {
            const fairList = fair
              .map((sp) => `"${sp.fairName}" está en curso o ha finalizado`)
              .join('; ')

            const message =
              fair.length === 1
                ? `Esta feria no se puede eliminar porque ${fairList}.`
                : `Estas ferias no se pueden eliminar porque: ${fairList}.`

            toast.error(message, {
              duration: 8000,
            })
            return
          }

          toast.error('No se puede completar la eliminación en este momento.')
          return
        }

        toast.error(`Error al eliminar las ferias: ${error.message}`)
        return
      }
      toast.error(`Error al eliminar la feria`)
    },
  })
}
export default useDeleteFairs

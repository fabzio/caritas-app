import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface DeleteScholarshipProps {
  ids: number[]
}
const IS_ONGOING_OR_ENDED_SCHOLARSHIP_ERROR = 'IS_ONGOING_OR_ENDED_SCHOLARSHIP'

const useDeleteScholarships = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (props: DeleteScholarshipProps) => {
      const { data, error } = await rpc.education.scholarship.delete(props)
      if (error) {
        if (error.status === 409) {
          throw new Error(IS_ONGOING_OR_ENDED_SCHOLARSHIP_ERROR, {
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
        queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP],
      })
      toast.success(`Beca${plural} eliminada exitosamente`)
    },
    onError: (error, variables) => {
      if (error instanceof Error) {
        if (error.message === IS_ONGOING_OR_ENDED_SCHOLARSHIP_ERROR) {
          console.log('errorcause: ', error.cause)
          const errorData = error.cause as {
            scholarshipsOngoingOrEnded: Array<{
              id: number
              name: string
            }>
          }

          const scholarshipsOngoingOrEnded =
            errorData?.scholarshipsOngoingOrEnded
          if (scholarshipsOngoingOrEnded?.length > 0) {
            const list = scholarshipsOngoingOrEnded
              .map((sp) => `"${sp.name}"`)
              .join('; ')

            const message =
              scholarshipsOngoingOrEnded.length === 1
                ? `Esta beca no se puede eliminar por haber iniciado el periodo de inscripción: ${list}.`
                : `Estas becas no se pueden eliminar por haber iniciado el periodo de inscripción: ${list}.`

            toast.error(message, {
              duration: 8000,
            })
            return
          }

          toast.error('No se puede completar la eliminación en este momento.')
          return
        }

        toast.error(`Error al eliminar las becas: ${error.message}`)
        return
      }
      const plural = variables.ids.length > 1 ? 's' : ''
      toast.error(`Error al eliminar la${plural} beca${plural}`)
    },
  })
}
export default useDeleteScholarships

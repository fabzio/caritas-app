import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export const useUpdateFairAttendance = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      id: number
      assistanceCount?: number | null
      fourthGradeAssistance?: number | null
      fifthGradeAssistance?: number | null
    }) => {
      const { id, ...body } = params
      const res = await rpc.education.fairs({ id }).attendance.patch(body)
      if (res.error) throw res.error
      return res.data
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Ocurrió un error al actualizar la asistencia',
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.FAIR, 'attendance'],
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.FAIR, variables.id],
      })

      toast.success('Asistencia actualizada correctamente')
      navigate({ to: '/organization/education/fair' })
    },
  })
}

import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      userId: string
      grade: string
      guardianEmail: string
    }) => {
      const { data, error } = await rpc.auth.info
        .student({
          userId: params.userId,
        })
        .patch({
          grade: params.grade,
          guardianEmail: params.guardianEmail,
        })
      if (error) throw error
      return data
    },
    onError: () => {
      toast.error('Error al actualizar la información del estudiante')
    },
    onSuccess: () => {
      toast.success('Información del estudiante actualizada correctamente')
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SETTINGS.STUDENT_PROFILE],
      })
    },
  })
}

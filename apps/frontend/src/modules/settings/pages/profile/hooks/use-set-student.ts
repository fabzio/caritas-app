import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useSetStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      userId: string
      grade: string
      guardianEmail: string
    }) => {
      const { data, error } = await rpc.auth.info.student.post({
        userId: params.userId,
        grade: params.grade,
        guardianEmail: params.guardianEmail,
      })
      if (error) throw error
      return data
    },
    onError: () => {
      toast.error('Error al establecer la información del estudiante')
    },
    onSuccess: () => {
      toast.success('Información del estudiante establecida correctamente')
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ACCESS],
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SETTINGS.STUDENT_PROFILE],
      })
    },
  })
}

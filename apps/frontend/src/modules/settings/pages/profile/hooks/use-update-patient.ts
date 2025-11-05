import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useUpdatePatient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      userId: string
      insuranceType: 'none' | 'public' | 'private'
    }) => {
      const { data, error } = await rpc.auth.info
        .patient({
          userId: params.userId,
        })
        .patch({
          insuranceType: params.insuranceType,
        })
      if (error) throw error
      return data
    },
    onError: () => {
      toast.error('Error al actualizar el tipo de seguro')
    },
    onSuccess: () => {
      toast.success('Tipo de seguro actualizado correctamente')
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SETTINGS.PATIENT_PROFILE],
      })
    },
  })
}

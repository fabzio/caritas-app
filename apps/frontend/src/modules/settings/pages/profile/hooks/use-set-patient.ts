import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useSetPatient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      userId: string
      insuranceType: 'none' | 'public' | 'private'
    }) => {
      const { data, error } = await rpc.auth.info.patient.post({
        userId: params.userId,
        insuranceType: params.insuranceType,
      })
      if (error) throw error
      return data
    },
    onError: () => {
      toast.error('Error al establecer la información del paciente')
    },
    onSuccess: () => {
      toast.success('Información del paciente establecida correctamente')
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ACCESS],
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SETTINGS.PATIENT_PROFILE],
      })
    },
  })
}

import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const usePostSpeciality = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { name: string }) => {
      const res = await rpc.health.speciality.post(params)
      if (res.error) throw res.error
      return res.data
    },
    onError: (error) => {
      toast.error(
        error?.message ||
          'Ocurrió un error desconocido al registrar la especialidad',
      )
    },
    onSuccess: (_) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SPECIALITY],
      })
      toast.success('Especialidad registrada correctamente')
    },
  })
}
export default usePostSpeciality

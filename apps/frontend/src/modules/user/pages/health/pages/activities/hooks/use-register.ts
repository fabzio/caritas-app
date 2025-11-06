import rpc from '@frontend/lib/rpc'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export const useRegister = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (params: { activityId: number; userId: string }) => {
      const { data, error } = await rpc.health.activities['add-attendant'].post(
        {
          userId: params.userId,
          activityId: params.activityId,
        },
      )
      if (error) throw error
      return data
    },
    onError: (error) => {
      toast.error(`Error al registrar en la actividad: ${error.message}`)
    },
    onSuccess: (data) => {
      toast.success('Registro exitoso en la actividad')
      navigate({
        to: '/user/health/activities/$id',
        params: { id: data.activityId.toString() },
      })
    },
  })
}

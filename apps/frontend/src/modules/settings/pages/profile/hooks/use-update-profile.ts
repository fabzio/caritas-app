import rpc from '@frontend/lib/rpc'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (params: {
      userId: string
      name: string
      surname: string
      phone: string
    }) => {
      return await rpc
        .users({
          id: params.userId || '',
        })
        .patch({
          name: params.name,
          surname: params.surname,
          phone: params.phone,
        })
    },
    onSuccess: () => {
      toast.success('Perfil actualizado correctamente')
    },
    onError: () => {
      toast.error('Error al actualizar el perfil')
    },
  })
}

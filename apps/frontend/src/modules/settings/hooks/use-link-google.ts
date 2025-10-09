import authClient from '@frontend/lib/authClient'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useLinkGoogle = () => {
  return useMutation({
    mutationFn: async () => {
      await authClient.linkSocial({
        provider: 'google',
        fetchOptions: {
          onSuccess: () => {
            toast.success('Cuenta de Google vinculada correctamente')
          },
          onError: () => {
            toast.error('Error al vincular la cuenta de Google')
          },
        },
      })
    },
  })
}

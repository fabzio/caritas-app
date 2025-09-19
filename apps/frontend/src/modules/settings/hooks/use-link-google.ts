import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import authClient from '@/lib/authClient'

export const useLinkGoogle = () => {
  return useMutation({
    mutationFn: async () => {
      await authClient.linkSocial({
        provider: 'google',
      })
    },
    onSuccess: () => {
      toast.success('Cuenta de Google vinculada correctamente')
    },
    onError: () => {
      toast.error('Error al vincular la cuenta de Google')
    },
  })
}

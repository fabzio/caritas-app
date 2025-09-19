import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import authClient from '@/lib/authClient'

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (params: {
      currentPassword: string
      newPassword: string
    }) => {
      const { data, error } = await authClient.changePassword({
        ...params,
        revokeOtherSessions: true,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Contraseña actualizada correctamente')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

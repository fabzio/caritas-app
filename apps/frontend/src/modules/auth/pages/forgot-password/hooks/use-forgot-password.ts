import authClient from '@frontend/lib/authClient'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await authClient.forgetPassword.emailOtp({
        email,
      })
      if (error) throw error
      return data
    },
    onError: () => {
      toast.error('Error al enviar el correo de recuperación')
    },
    onSuccess: () => {
      toast.success('Se ha enviado el correo de recuperación')
    },
  })
}

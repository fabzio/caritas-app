import authClient from '@frontend/lib/authClient'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export const useForgotPassword = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (params: { email: string; token?: string }) => {
      const { data, error } = await authClient.forgetPassword.emailOtp({
        email: params.email,
        fetchOptions: {
          headers: {
            'x-captcha-response': params.token as string,
          },
        },
      })
      if (error) throw error
      return data
    },
    onError: () => {
      toast.error('Error al enviar el correo de recuperación')
    },
    onSuccess: (_, { email }) => {
      navigate({
        to: '/auth/forgot-password',
        search: {
          email,
        },
      })
      toast.success('Se ha enviado el correo de recuperación')
    },
  })
}

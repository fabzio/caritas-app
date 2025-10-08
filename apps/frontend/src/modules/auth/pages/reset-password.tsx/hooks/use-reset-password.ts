import authClient from '@frontend/lib/authClient'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export const useResetPassword = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (params: {
      email: string
      otp: string
      password: string
    }) => {
      const { data, error } = await authClient.emailOtp.resetPassword(params)
      if (error) throw error
      return data
    },
    onError: () => {
      toast.error('Error al restablecer la contraseña')
    },
    onSuccess: ({ success }) => {
      if (success) {
        toast.success('Contraseña restablecida con éxito')
        navigate({
          to: '/auth/login',
          search: {
            redirect: '/',
          },
        })
      } else toast.error('No se pudo restablecer la contraseña')
    },
  })
}

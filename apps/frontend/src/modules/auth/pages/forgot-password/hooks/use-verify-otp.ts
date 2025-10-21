import authClient from '@frontend/lib/authClient'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export const useVerifyOtp = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (params: { email: string; otp: string }) => {
      const { data, error } = await authClient.emailOtp.checkVerificationOtp({
        email: params.email,
        otp: params.otp,
        type: 'forget-password',
      })
      if (error) throw error
      return data
    },
    onSuccess: (_, { email, otp }) => {
      navigate({
        to: '/auth/reset-password',
        search: {
          email,
          otp,
        },
      })
    },
    onError: ({ message }) => {
      toast.error(message || 'Error al verificar el código OTP')
    },
  })
}

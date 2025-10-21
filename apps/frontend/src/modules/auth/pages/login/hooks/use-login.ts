import authClient from '@frontend/lib/authClient'
import type { ValidRoutes } from '@frontend/shared/types/valid-routes'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useLogin = (redirectPath: ValidRoutes) => {
  return useMutation({
    mutationFn: async (params: {
      email: string
      password: string
      rememberMe: boolean
      token: string
    }) => {
      const { data, error } = await authClient.signIn.email({
        email: params.email,
        password: params.password,
        rememberMe: params.rememberMe,
        callbackURL: redirectPath,
        fetchOptions: {
          onSuccess: () => {
            toast.success('Inicio de sesión exitoso')
          },
          onError: (error) => {
            toast.error(error.error.message || 'Error al iniciar sesión')
          },
          headers: {
            'x-captcha-response': params.token,
          },
        },
      })
      if (error) throw error
      return data
    },
  })
}

import { useMutation } from '@tanstack/react-query'
import authClient from '@/lib/authClient'
import type { ValidRoutes } from '@/shared/types/valid-routes'

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

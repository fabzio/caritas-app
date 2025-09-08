import { useMutation } from '@tanstack/react-query'
import authClient from '@/lib/authClient'

export const useLogin = (redirectPath: string) => {
  return useMutation({
    mutationFn: (params: {
      email: string
      password: string
      rememberMe: boolean
    }) =>
      authClient.signIn.email({
        email: params.email,
        password: params.password,
        rememberMe: params.rememberMe,
        callbackURL: redirectPath,
      }),
  })
}

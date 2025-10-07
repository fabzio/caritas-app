import authClient from '@frontend/lib/authClient'
import { useMutation } from '@tanstack/react-query'

export const useGoogle = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.signIn.social({
        provider: 'google',
      })
      if (error) throw error
      return data
    },
  })
}

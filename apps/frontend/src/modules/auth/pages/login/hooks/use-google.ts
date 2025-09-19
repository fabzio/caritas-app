import { useMutation } from '@tanstack/react-query'
import authClient from '@/lib/authClient'

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

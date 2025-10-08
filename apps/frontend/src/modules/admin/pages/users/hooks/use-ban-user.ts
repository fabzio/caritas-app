import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface BanUserProps {
  userId: string
  banReason: string
  banExpiresIn?: number
}

export const useBanUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      banReason,
      banExpiresIn = undefined,
    }: BanUserProps) => {
      const { data, error } = await authClient.admin.banUser({
        userId: userId,
        banReason: banReason,
        banExpiresIn: banExpiresIn,
      })
      if (error) {
        throw new Error(
          error.message || 'Error desconocido al banear el usuario.',
        )
      }
      return data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADMIN.USERS] })
    },
  })
}

import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface RemoveUserProps {
  userId: string
}

export const useRemoveUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId }: RemoveUserProps) => {
      const { data, error } = await authClient.admin.updateUser({
        userId: userId,
        data: { active: false },
      })
      if (error) {
        throw new Error(
          error.message || 'Error desconocido al eliminar el usuario.',
        )
      }
      return data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADMIN.USERS] })
    },
  })
}

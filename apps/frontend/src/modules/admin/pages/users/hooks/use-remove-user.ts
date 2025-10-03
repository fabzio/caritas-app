import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface RemoveUserProps {
  userId: string
}

export const useRemoveUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId }: RemoveUserProps) => {
      const { data, error } = await authClient.admin.removeUser({
        userId: userId,
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
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import authClient from '@/lib/authClient'
import { QueryKeys } from '@/shared/constants/query-keys'

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

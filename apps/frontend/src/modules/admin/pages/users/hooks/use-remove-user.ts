import authClient from '@frontend/lib/authClient'
import { useMutation } from '@tanstack/react-query'

interface RemoveUserProps {
  userId: string
}

export const useRemoveUser = () => {
  return useMutation({
    mutationFn: async ({ userId }: RemoveUserProps) => {
      const { data, error } = await authClient.organization.removeMember({
        memberIdOrEmail: userId,
      })
      if (error) {
        throw new Error(
          error.message || 'Error desconocido al eliminar el usuario.',
        )
      }
      return data
    },
  })
}

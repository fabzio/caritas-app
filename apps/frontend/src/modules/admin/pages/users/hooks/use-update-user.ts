import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type UpdateUserProps = Parameters<typeof authClient.admin.updateUser>[0]

interface UseUpdateUserProps {
  onSuccess: () => void
}
export const useUpdateUser = ({ onSuccess }: UseUpdateUserProps) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: UpdateUserProps) => {
      const { data, error } = await authClient.admin.updateUser(props)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADMIN.USERS] })
      onSuccess()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

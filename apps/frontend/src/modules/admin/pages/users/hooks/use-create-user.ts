import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type CreateUserProps = Parameters<typeof authClient.admin.createUser>[0]

interface UseCreateUserProps {
  onSuccess: () => void
}
export const useCreateUser = ({ onSuccess }: UseCreateUserProps) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: CreateUserProps) => {
      const { data, error } = await authClient.admin.createUser(props)
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

import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type CreateUserProps = Parameters<typeof rpc.users.post>[0]

interface useCreateUserProps {
  onSuccess: () => void
}
export const useCreateUser = ({ onSuccess }: useCreateUserProps) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: CreateUserProps) => {
      const { data, error } = await rpc.users.post({ ...props })
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

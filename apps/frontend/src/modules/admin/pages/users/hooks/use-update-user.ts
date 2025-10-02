import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type UpdateUserBodyProps = Parameters<typeof rpc.users.put>[0]

export const useUpdateUser = ({ onSuccess }: { onSuccess: () => void }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      body,
      id,
    }: {
      body: UpdateUserBodyProps
      id: string
    }) => {
      const { data, error } = await rpc.users.put(body, { query: { id } })
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

import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { FormUserSchema } from '@frontend/shared/models/user'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type UpdateUserBodyProps = Partial<FormUserSchema>

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
      const { data, error } = await authClient.admin.updateUser({
        userId: id,
        data: {
          ...body,
        },
      })
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

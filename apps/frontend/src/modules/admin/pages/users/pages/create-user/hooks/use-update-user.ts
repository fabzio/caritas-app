import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type UpdateUserProps = Parameters<typeof authClient.admin.updateUser>[0] & {
  teamId?: string
}

export const useUpdateUser = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: UpdateUserProps) => {
      const { data, error } = await authClient.admin.updateUser(props)
      if (error) throw error
      if (props.teamId)
        await rpc.admin
          .users({
            id: props.userId as string,
          })
          .patch({
            teamId: props.teamId,
          })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADMIN.USERS] })
      toast.success('Modificado el usuario exitosamente')
      navigate({
        to: '/admin/users',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

import { useSession } from '@frontend/hooks/use-session'
import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type UpdateUserProps = Parameters<typeof authClient.admin.updateUser>[0] & {
  teamIds?: string[]
}

export const useUpdateUser = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  return useMutation({
    mutationFn: async (props: UpdateUserProps) => {
      const { teamIds, ...userPayload } = props
      const { data, error } = await authClient.admin.updateUser(userPayload)
      if (error) throw error
      if (teamIds && teamIds.length > 0)
        await rpc.admin
          .users({
            id: props.userId as string,
          })
          .patch({
            teamIds,
          })
      return data
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADMIN.USERS] })
      if (session?.user.id === userId)
        queryClient.invalidateQueries({ queryKey: [QueryKeys.ACCESS] })
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

import { useSession } from '@frontend/hooks/use-session'
import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type CreateUserProps = Parameters<typeof authClient.admin.createUser>[0] & {
  teamIds: string[]
}

export const useCreateUser = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: user } = useSession()
  return useMutation({
    mutationFn: async (props: CreateUserProps) => {
      const { teamIds, ...userPayload } = props
      const { data, error } = await authClient.admin.createUser(userPayload)
      if (error) throw error
      await rpc.admin.users.post({
        organizationId: user?.session.activeOrganizationId as string,
        userId: data.user.id,
        teamIds,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ADMIN.USERS] })
      toast.success('Creado el usuario exitosamente')
      navigate({
        to: '/admin/users',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

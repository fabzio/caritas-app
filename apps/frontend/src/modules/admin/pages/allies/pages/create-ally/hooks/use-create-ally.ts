import { useSession } from '@frontend/hooks/use-session'
import authClient from '@frontend/lib/authClient'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type CreateAllyProps = {
  name: string
}

export const useCreateOrganization = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (props: CreateAllyProps) => {
      const { data, error } = await rpc.admin.organization.post(props)
      if (error) throw error
      await rpc.admin.organization.post({
        name: props.name,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ADMIN.ORGANIZATION],
      })
      toast.success('Creada organización exitosamente')
      navigate({
        to: '/admin/allies',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

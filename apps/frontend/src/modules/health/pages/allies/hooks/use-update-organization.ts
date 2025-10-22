import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

interface UpdateAllyProps {
  id: string
  name: string
}

export default function useUpdateAlly() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: UpdateAllyProps) => {
      const { data, error } = await rpc.admin
        .organization({
          id: props.id,
        })
        .patch({
          name: props.name,
        })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ADMIN.ORGANIZATION],
      })
      toast.success('Organización modificada exitosamente')
      navigate({ to: '/health/allies' })
    },
  })
}

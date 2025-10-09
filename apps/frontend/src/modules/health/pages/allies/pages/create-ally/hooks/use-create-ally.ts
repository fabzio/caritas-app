import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

type CreateAllyProps = {
  name: string
}

export const useCreateAlly = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (props: CreateAllyProps) => {
      const { data, error } = await rpc.admin.organization.post({
        name: props.name,
        type: 'health',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkP-gtKIteijyewNjDaWUPoV4LEI-sZtgRiw&s',
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ADMIN.ORGANIZATION],
      })
      toast.success('Creado aliado exitosamente')
      navigate({
        to: '/health/allies',
      })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

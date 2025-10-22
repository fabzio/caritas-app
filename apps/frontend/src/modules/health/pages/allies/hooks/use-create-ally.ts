import authClient from '@frontend/lib/authClient'
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
      const { data, error } = await authClient.organization.create({
        name: props.name,
        slug: props.name.toLowerCase().replace(/\s+/g, '-'),
        type: 'health',
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ADMIN.ALLIES],
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

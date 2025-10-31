import rpc from '@frontend/lib/rpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export type UseCreateAttentionProps = Parameters<
  typeof rpc.health.activities.attentions.post
>[0]

export const useCreateAttention = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (props: UseCreateAttentionProps) => {
      const { data, error } = await rpc.health.activities.attentions.post(props)
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-attentions', variables.userId],
        exact: false,
      })
      toast.success('Atención registrada correctamente')
    },
    onError: () => {
      toast.error('Error al registrar la atención')
    },
  })
}

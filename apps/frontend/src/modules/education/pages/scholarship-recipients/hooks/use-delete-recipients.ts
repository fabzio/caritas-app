import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type RejectBatchInput = {
  ids: number[]
  comments?: string
}

export function useDeleteRecipients() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RejectBatchInput) => {
      const { data, error } =
        await rpc.education.scholarship.application.reject.patch(input)
      if (error) {
        throw error
      }
      return data
    },
    onSuccess: (_, props) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_RECIPIENTS],
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_APPLICATION],
      })
      toast.success(
        `Se rechaz${props.ids.length > 1 ? 'aron' : 'ó'} ${props.ids.length} becado${props.ids.length > 1 ? 's' : ''}`,
      )
    },
    onError: (error) => {
      toast.error(
        `Error al rechazar becados: ${error?.message ?? String(error)}`,
      )
    },
  })
}

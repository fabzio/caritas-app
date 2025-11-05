import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type RejectBatchInput = {
  ids: number[]
  comments?: string
}

export function useRejectApplicants() {
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
        queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_APPLICATION],
      })
      toast.success(
        `Se rechaz${props.ids.length > 1 ? 'aron' : 'ó'} ${props.ids.length} postulante${props.ids.length > 1 ? 's' : ''}`,
      )
    },
    onError: (error) => {
      toast.error(
        `Error al rechazar postulantes: ${error?.message ?? String(error)}`,
      )
    },
  })
}

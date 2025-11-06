import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type AcceptBatchInput = {
  ids: number[]
  comments?: string
}

export function useAcceptApplicants() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AcceptBatchInput) => {
      const { data, error } =
        await rpc.education.scholarship.application.accept.patch(input)
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_APPLICATION],
      })
      toast.success(
        `Se acept${variables.ids.length > 1 ? 'aron' : 'ó'} ${variables.ids.length} postulante${variables.ids.length > 1 ? 's' : ''}`,
      )
    },
    onError: (error) => {
      toast.error(
        `Error al aceptar postulantes: ${error?.message ?? String(error)}`,
      )
    },
  })
}

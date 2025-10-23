import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_APPLICATION],
      })
    },
  })
}

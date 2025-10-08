import { useMutation, useQueryClient } from '@tanstack/react-query'
import rpc from '../../../../lib/rpc'
import { QueryKeys } from '../../../../shared/constants/query-keys'

type AcceptBatchInput = {
  ids: number[]
  comments?: string
}

export function useAcceptBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AcceptBatchInput) => {
      const { data, error } =
        await rpc.education['scholarship-application']['accept-batch'].patch(
          input,
        )
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SCHOLARSHIP_APPLICATION],
      })
    },
  })
}

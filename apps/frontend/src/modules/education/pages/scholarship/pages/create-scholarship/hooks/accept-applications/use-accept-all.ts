import { useMutation, useQueryClient } from '@tanstack/react-query'
import rpc from '../../../../lib/rpc'
import { QueryKeys } from '../../../../shared/constants/query-keys'

type AcceptAllInput = {
  scholarshipId: number
  comments?: string
}

export function useAcceptAll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AcceptAllInput) => {
      const body = input.comments ? { comments: input.comments } : {}
      const { data, error } =
        await rpc.education['scholarship-application'][
          input.scholarshipId.toString()
        ]['accept-all'].patch(body)
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

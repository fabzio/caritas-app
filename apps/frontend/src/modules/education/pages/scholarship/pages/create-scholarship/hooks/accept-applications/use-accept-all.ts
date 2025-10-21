import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type AcceptAllInput = {
  scholarshipId: number
  comments?: string
}

export function useAcceptAll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AcceptAllInput) => {
      const body = input.comments ? { comments: input.comments } : {}
      const { data, error } = await rpc.education.scholarship
        .application({
          scholarshipId: input.scholarshipId,
        })
        
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

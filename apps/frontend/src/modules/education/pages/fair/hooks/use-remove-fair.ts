import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type RemoveFairArgs = {
  fairId: number
}

export const useRemoveFair = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ fairId }: RemoveFairArgs) => {
      const res = await rpc.education.fairs({ id: fairId }).patch({
        active: false,
      })
      if (res.error) throw res.error
      if (!res.data) {
        throw new Error('No se pudo eliminar la feria.')
      }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EDUCATION.FAIR] })
    },
  })
}

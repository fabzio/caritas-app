import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

export const useSingleBeneficiary = (id: string) => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.HEALTH.BENEFICIARIES, id],
    queryFn: async () => {
      const { data, error } = await rpc.health.beneficiaries({ id }).get()
      if (error) throw error
      return data
    },
  })
}

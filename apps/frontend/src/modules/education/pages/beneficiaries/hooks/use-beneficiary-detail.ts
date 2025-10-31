import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

export const useBeneficiaryDetail = (id?: string) => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.EDUCATION.BENEFICIARIES, id || ''],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await rpc.education.beneficiaries({ id }).get()
      if (error) throw error
      return data || null
    },
  })
}

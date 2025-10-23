import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export type Beneficiary = NonNullable<
  Awaited<ReturnType<typeof rpc.admin.users.beneficiaries.get>>['data']
>[number]

export function useGetBeneficiaries() {
  return useQuery({
    queryKey: [QueryKeys.ADMIN.USERS, 'beneficiaries'],
    queryFn: async () => {
      const { data, error } = await rpc.admin.users.beneficiaries.get()
      if (error) throw error
      return data
    },
  })
}

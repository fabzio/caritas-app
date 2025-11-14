import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'
export type AcceptedUser = {
  id: string
  name: string
  email: string
  applicationDate: string
}
type UseAcceptedUsersParams = {
  scholarshipId: number
  name?: string
}
export const useAcceptedUsers = ({
  scholarshipId,
  name = '',
}: UseAcceptedUsersParams) => {
  return useQuery({
    queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_ACCEPTED, scholarshipId, name],
    queryFn: async () => {
      const { data, error } = await rpc.education.scholarship.application[
        'accepted-users'
      ].get({
        query: {
          scholarshipId,
          name,
        },
      })
      if (error) throw error
      return data.data
    },
    enabled: !!scholarshipId && name.length >= 2,
  })
}

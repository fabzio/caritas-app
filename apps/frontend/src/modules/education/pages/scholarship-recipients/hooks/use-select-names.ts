import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export const useSelectNames = () => {
  return useQuery({
    queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_RECIPIENTS],
    queryFn: async () => {
      const { data, error } =
        await rpc.education.scholarship.recipients.selectNames.get()
      if (error) throw error
      return data
    },
  })
}

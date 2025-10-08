import { useQuery } from '@tanstack/react-query'
import rpc from '@/lib/rpc'
import { QueryKeys } from '@/shared/constants/query-keys'
import type { Filters } from '@/shared/types/filters'

type UseScholarshipRecipientsParams = {
  currentPage?: number
  pageSize?: number
  filters?: Filters
}

export const useScholarshipRecipients = ({
  currentPage = 1,
  pageSize = 10,
  filters,
}: UseScholarshipRecipientsParams) => {
  return useQuery({
    queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_RECIPIENTS, filters],
    queryFn: async () => {
      const { data, error } = await rpc.education.scholarshipRecipients.get({
        query: {
          q: filters?.q || '',
          page: Math.max(0, (currentPage || 1) - 1),
          limit: pageSize,
          sortBy: filters?.sortBy || 'name.asc',
        },
      })
      if (error) throw error
      return data
    },
  })
}

export type RecipientResponse = NonNullable<
  ReturnType<typeof useScholarshipRecipients>['data']
>
export type Recipient = RecipientResponse['data'][number]

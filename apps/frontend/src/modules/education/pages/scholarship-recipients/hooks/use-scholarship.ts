import rpc from '@frontend/lib/rpc'
import type { RecipientFilters } from '@frontend/routes/_authenticated/education/recipients'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

type UseScholarshipRecipientsParams = {
  currentPage?: number
  pageSize?: number
  filters?: RecipientFilters
}

export const useScholarshipRecipients = ({
  currentPage = 1,
  pageSize = 10,
  filters,
}: UseScholarshipRecipientsParams) => {
  return useQuery({
    queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_RECIPIENTS, filters],
    queryFn: async () => {
      const { data, error } = await rpc.education.scholarship.recipients.get({
        query: {
          q: filters?.q || '',
          page: Math.max(0, (currentPage || 1) - 1),
          limit: pageSize,
          sortBy: filters?.sortBy || 'name.asc',
          selectFilters: {
            scholarshipName: filters?.selectFilters?.scholarshipName || 'all',
            regionNames: filters?.selectFilters?.regionNames || 'all',
          },
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

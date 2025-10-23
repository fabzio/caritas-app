import rpc from '@frontend/lib/rpc'
import ScholarshipRecipients from '@frontend/modules/education/pages/scholarship-recipients'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'

export type RecipientFilters = Filters & {
  selectFilters?: {
    scholarshipName?: string
    regionNames?: string
  }
}

export const Route = createFileRoute('/_authenticated/education/recipients/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData({
      queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_RECIPIENTS, {}],
      queryFn: async () => {
        const { data, error } = await rpc.education.scholarship.recipients.get(
          {},
        )
        if (error) throw error
        return data || { members: [], total: 0 }
      },
    }),
  validateSearch: () => ({}) as RecipientFilters,
  component: ScholarshipRecipients,
})

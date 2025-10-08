import authClient from '@frontend/lib/authClient'
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

export const Route = createFileRoute('/_authenticated/education/recipients')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData({
      queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_RECIPIENTS, []],
      queryFn: async () => {
        const { data, error } = await authClient.admin.listUsers({
          query: {
            limit: 10,
            offset: 0,
          },
        })
        if (error) throw error
        return data || { members: [], total: 0 }
      },
    }),
  validateSearch: () => ({}) as RecipientFilters,
  component: ScholarshipRecipients,
})

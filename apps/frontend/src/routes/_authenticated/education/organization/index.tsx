import rpc from '@frontend/lib/rpc'
import OrganizationTableView from '@frontend/modules/education/pages/allies'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export type OrganizationFilters = Filters & {
  active?: boolean
}

const organizationFiltersSchema = z.object({
  active: z.boolean().optional(),
  q: z.string().optional(),
  pageIndex: z.number().optional(),
  pageSize: z.number().optional(),
  sortBy: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/education/organization/')(
  {
    loader: async ({ context: { queryClient } }) => {
      queryClient.ensureQueryData({
        queryKey: [QueryKeys.ORGANIZATIONS],
        queryFn: async () => {
          const { data, error } = await rpc.admin.organization.get({
            query: {
              page: 0,
              limit: 10,
              sortBy: 'name.asc',
              type: 'education',
            },
          })
          if (error) throw error
          return data
        },
      })
    },
    validateSearch: organizationFiltersSchema,
    component: OrganizationTableView,
  },
)

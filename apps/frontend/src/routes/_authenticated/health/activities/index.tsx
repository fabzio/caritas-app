import rpc from '@frontend/lib/rpc'
import ActivityPage from '@frontend/modules/health/pages/activities'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const ActivitySearchSchema = z.object({
  q: z.string().optional(),
  page: z.number().default(0),
  limit: z.number().default(10),
  sortBy: z.string().optional(),
  regionIds: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/health/activities/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData({
      queryKey: [QueryKeys.HEALTH.ACTIVITIES, {}],

      queryFn: async () => {
        const { data, error } = await rpc.health.activities.get({
          query: {
            limit: 10,
            page: 0,
            sortBy: 'name.asc',
          },
        })

        if (error) throw error
        return data || { data: [], total: 0, page: 0, totalPages: 1, limit: 10 }
      },
    }),

  validateSearch: ActivitySearchSchema,
  component: ActivityPage,
})

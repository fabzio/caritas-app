import rpc from '@frontend/lib/rpc'
import AddAttendantPage from '@frontend/modules/health/pages/activities/pages/add-attendant'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute(
  '/_authenticated/health/activities/$activityId/form',
)({
  loader: async ({ context: { queryClient }, params }) => {
    const activityId = params.activityId
    if (!activityId) return undefined

    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.HEALTH.ACTIVITIES, activityId],
      queryFn: async () => {
        const { data, error } = await rpc.health
          .activities({ id: activityId })
          .get()
        if (error) throw error
        return data || undefined
      },
    })
  },
  validateSearch: z.object({
    id: z.optional(z.string()),
    type: z.enum(['new', 'edit']),
  }),
  component: AddAttendantPage,
})

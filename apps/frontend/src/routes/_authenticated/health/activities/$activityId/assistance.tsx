import rpc from '@frontend/lib/rpc'
import AssistancePage from '@frontend/modules/health/pages/activities/pages/assistance'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/health/activities/$activityId/assistance',
)({
  loader: async ({ context: { queryClient }, params: { activityId } }) => {
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
  component: AssistancePage,
})

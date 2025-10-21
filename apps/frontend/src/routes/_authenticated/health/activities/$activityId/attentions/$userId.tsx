import rpc from '@frontend/lib/rpc'
import AttentionsPage from '@frontend/modules/health/pages/activities/pages/attentions'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/health/activities/$activityId/attentions/$userId',
)({
  loader: async ({
    context: { queryClient },
    params: { activityId, userId },
  }) => {
    const activityData = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.HEALTH.ACTIVITIES, activityId],
      queryFn: async () => {
        const { data, error } = await rpc.health
          .activities({
            id: activityId,
          })
          .get()
        if (error) throw error
        return data || undefined
      },
    })

    const participantData = await queryClient.ensureQueryData({
      queryKey: ['activity-participant', activityId, userId],
      queryFn: async () => {
        const { data, error } = await rpc.health.activities.participants.get({
          query: {
            activityId,
            q: '',
          },
        })
        if (error) throw error
        const participant = data?.find((p) => p.id === userId)
        return participant || undefined
      },
    })

    return {
      activity: activityData,
      participant: participantData,
    }
  },
  component: AttentionsPage,
})

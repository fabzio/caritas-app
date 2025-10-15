import rpc from '@frontend/lib/rpc'
import AttentionsPage from '@frontend/modules/health/pages/activities/pages/attentions'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute(
  '/_authenticated/health/activities/attentions',
)({
  loaderDeps: ({ search: { activityId, userId } }) => ({
    activityId,
    userId,
  }),
  loader: async ({
    context: { queryClient },
    deps: { activityId, userId },
  }) => {
    if (!activityId || !userId) return undefined

    // Load activity data
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

    // Load participant data
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
  validateSearch: z.object({
    activityId: z.coerce.string(),
    userId: z.string(),
  }),
  component: AttentionsPage,
})

import rpc from '@frontend/lib/rpc'
import UserActivityDetail from '@frontend/modules/user/pages/health/pages/activities/page/detail'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/user/health/activities/$id',
)({
  loader: async ({ context: { queryClient }, params: { id } }) => {
    const activityData = await queryClient.ensureQueryData({
      queryKey: [QueryKeys.HEALTH.ACTIVITIES, id],
      queryFn: async () => {
        const { data, error } = await rpc.health.activities({ id }).get()
        if (error) throw error
        return data || undefined
      },
    })
    return { activity: activityData }
  },
  component: UserActivityDetail,
})

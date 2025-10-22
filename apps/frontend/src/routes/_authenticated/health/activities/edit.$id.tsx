import rpc from '@frontend/lib/rpc'
import EditActivityForm from '@frontend/modules/health/pages/activities/pages/edit-activity-form'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/health/activities/edit/$id',
)({
  loader: async ({ context: { queryClient }, params: { id } }) =>
    await queryClient.ensureQueryData({
      queryKey: [QueryKeys.HEALTH.ACTIVITY, id],
      queryFn: async () => {
        const { data, error } = await rpc.health.activities({ id }).get()

        if (error) {
          throw new Error(error.value as string)
        }

        return data
      },
    }),
  component: EditActivityForm,
})

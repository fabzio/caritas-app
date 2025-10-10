import rpc from '@frontend/lib/rpc'
import AssistancePage from '@frontend/modules/health/pages/activities/pages/assistance'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute(
  '/_authenticated/health/activities/assistance',
)({
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ context: { queryClient }, deps: { id } }) => {
    if (!id) return undefined

    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.HEALTH.ACTIVITIES, id],
      queryFn: async () => {
        const { data, error } = await rpc.health.activities({ id }).get()
        if (error) throw error
        return data || undefined
      },
    })
  },
  validateSearch: z.object({
    id: z.coerce.string(),
  }),
  component: AssistancePage,
})

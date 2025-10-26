import rpc from '@frontend/lib/rpc'
import FormView from '@frontend/modules/health/pages/beneficiaries/pages/edit-beneficiary'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute(
  '/_authenticated/health/beneficiaries/form',
)({
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ context: { queryClient }, deps: { id } }) => {
    if (!id) return undefined

    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.HEALTH.BENEFICIARIES, id],
      queryFn: async () => {
        const { data, error } = await rpc.health.beneficiaries({ id }).get()
        if (error) throw error
        return data || undefined
      },
    })
  },
  validateSearch: z.object({
    id: z.optional(z.string()),
    type: z.enum(['edit']),
  }),
  component: FormView,
})

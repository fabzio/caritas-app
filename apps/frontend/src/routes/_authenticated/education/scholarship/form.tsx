import rpc from '@frontend/lib/rpc'
import CreateScholarship from '@frontend/modules/education/pages/scholarship/pages/create-scholarship'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute(
  '/_authenticated/education/scholarship/form',
)({
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ context: { queryClient }, deps: { id } }) => {
    if (!id) return undefined

    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.SCHOLARSHIP, id],
      queryFn: async () => {
        const { data, error } = await rpc.education
          .scholarship({ id: String(id) })
          .get()
        return data || undefined
      },
      gcTime: 0,
    })
  },
  validateSearch: z.object({
    id: z.optional(z.union([z.string(), z.number()])),
    type: z.enum(['new', 'edit']),
  }),
  component: CreateScholarship,
})

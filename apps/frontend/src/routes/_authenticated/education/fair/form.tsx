import rpc from '@frontend/lib/rpc'
import CreateFairPage from '@frontend/modules/education/pages/fair/pages/create-fair'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/education/fair/form')({
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ context: { queryClient }, deps: { id } }) => {
    if (!id) return undefined

    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.EDUCATION.FAIR, id],
      queryFn: async () => {
        const { data, error } = await rpc.education
          .fairs({ id: String(id) })
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
  component: CreateFairPage,
})

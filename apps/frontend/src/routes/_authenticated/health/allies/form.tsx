import rpc from '@frontend/lib/rpc'
import AllyFormView from '@frontend/modules/health/pages/allies/pages/create-ally'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/health/allies/form')({
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ context: { queryClient }, deps: { id } }) => {
    if (!id) return undefined

    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.ADMIN.USERS, id],
      queryFn: async () => {
        const { data, error } = await rpc.admin.organization({ id }).get()
        if (error) throw error
        return data || undefined
      },
    })
  },
  validateSearch: z.object({
    id: z.optional(z.string()),
    type: z.enum(['new', 'edit']),
  }),
  component: AllyFormView,
})

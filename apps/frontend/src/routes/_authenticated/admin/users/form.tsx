import rpc from '@frontend/lib/rpc'
import UserFormView from '@frontend/modules/admin/pages/users/subpages/userFormView'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/admin/users/form')({
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ context: { queryClient }, deps: { id } }) => {
    if (!id) return undefined

    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.ADMIN.USERS],
      queryFn: async () => {
        const { data, error } = await rpc.users.get({ query: { id: '123' } })
        if (error) throw error
        return data || undefined
      },
    })
  },
  validateSearch: z.object({
    id: z.optional(z.string()),
    type: z.enum(['new', 'edit']),
  }),
  component: UserFormView,
})

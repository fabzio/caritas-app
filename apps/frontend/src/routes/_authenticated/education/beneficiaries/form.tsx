import rpc from '@frontend/lib/rpc'
import FormView from '@frontend/modules/education/pages/beneficiaries/pages/edit-beneficiary'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute(
  '/_authenticated/education/beneficiaries/form',
)({
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ context: { queryClient }, deps: { id } }) => {
    if (!id) return undefined

    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.EDUCATION.BENEFICIARIES, id],
      queryFn: async () => {
        const { data, error } = await rpc.education.beneficiaries({ id }).get()
        if (error) throw error
        return data || undefined
      },
    })
  },
  validateSearch: z
    .object({
      id: z.optional(z.string()),
      type: z.enum(['edit', 'new']),
    })
    .refine((value) => (value.type === 'edit' ? Boolean(value.id) : true), {
      message: 'El identificador es requerido para editar',
      path: ['id'],
    }),
  component: FormView,
})

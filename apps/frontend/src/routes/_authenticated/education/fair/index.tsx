import rpc from '@frontend/lib/rpc'
import FairPage from '@frontend/modules/education/pages/fair'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'

export type FairsFilters = Filters & {
  district?: string
  status?: string
}

export const Route = createFileRoute('/_authenticated/education/fair/')({
  loader: async ({ context: { queryClient } }) =>
    await queryClient.ensureQueryData({
      queryKey: [QueryKeys.EDUCATION.FAIR, {}],
      queryFn: async () => {
        const response = await rpc.education.fairs.get({})

        if (response.error) {
          throw new Error(response.error.value as string)
        }

        return response.data
      },
    }),
  component: FairPage,
  validateSearch: () => ({}) as FairsFilters,
})

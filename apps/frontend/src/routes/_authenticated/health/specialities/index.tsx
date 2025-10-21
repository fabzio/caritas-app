import rpc from '@frontend/lib/rpc'
import SpecialityPage from '@frontend/modules/health/pages/specialities'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import type { Filters } from '@frontend/shared/types/filters'
import { createFileRoute } from '@tanstack/react-router'

export type SpecialitiesFilters = Filters & {
  search?: string
}

export const Route = createFileRoute('/_authenticated/health/specialities/')({
  loader: async ({ context: { queryClient, authClient } }) => {
    const { data } = await authClient.getSession()
    if (!data) return

    const {
      session: { activeOrganizationId },
    } = data

    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.HEALTH.SPECIALITIES],
      queryFn: async () => {
        const { data, error } = await rpc.health.speciality.get({
          query: {
            organizationId: activeOrganizationId || '',
          },
        })
        if (error) throw error
        return data || { specialities: [], total: 0 }
      },
    })
  },
  validateSearch: () => ({}) as SpecialitiesFilters,
  component: SpecialityPage,
})

import rpc from '@frontend/lib/rpc'
import FairAttendancePage from '@frontend/modules/organization/pages/education/fair/pages/attendance'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/organization/education/fair/$id/attendance',
)({
  loader: async ({ context: { queryClient }, params: { id } }) => {
    return await queryClient.ensureQueryData({
      queryKey: [QueryKeys.EDUCATION.FAIR, 'attendance', Number(id)],
      queryFn: async () => {
        const { data, error } = await rpc.education
          .fairs({ id: String(id) })
          .get()
        if (error) throw error
        return data || undefined
      },
      gcTime: 0,
    })
  },
  component: FairAttendancePage,
})

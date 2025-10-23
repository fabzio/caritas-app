import rpc from '@frontend/lib/rpc'
import ViewScholarship from '@frontend/modules/education/pages/scholarship/pages/view-scholarship'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/education/scholarship/$scholarshipId/view',
)({
  loader: async ({ context: { queryClient }, params: { scholarshipId } }) =>
    await queryClient.ensureQueryData({
      queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP, scholarshipId],
      queryFn: async () => {
        const { data, error } = await rpc.education
          .scholarship({
            id: scholarshipId,
          })
          .get()
        if (error) throw error
        return data
      },
    }),
  component: ViewScholarship,
})

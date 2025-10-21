import rpc from '@frontend/lib/rpc'
import ApplyPage from '@frontend/modules/education/pages/landing/pages/apply'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/landing/apply')({
  component: ApplyPage,
  loader: async ({ context: { authClient, queryClient } }) => {
    const { data: authData, error: authError } = await queryClient.fetchQuery({
      queryKey: [QueryKeys.SESSION],
      queryFn: () => authClient.getSession(),
      staleTime: Infinity,
    })
    if (authError) throw authError

    const { data: scholarships, error: scholarshipsError } =
      await rpc.education.scholarship.get()
    if (scholarshipsError) throw scholarshipsError

    return {
      isLoggedIn: !!authData?.user,
      user: authData?.user,
      scholarships,
    }
  },
})

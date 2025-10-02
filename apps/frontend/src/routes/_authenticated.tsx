import { QueryKeys } from '@frontend/shared/constants/query-keys'
import MainLayout from '@frontend/shared/layouts/main-layout'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context: { authClient, queryClient }, location }) => {
    const { data } = await queryClient.fetchQuery({
      queryKey: [QueryKeys.SESSION],
      queryFn: () => authClient.getSession(),
      staleTime: Infinity,
    })

    if (!data)
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: location.href,
        },
      })
  },
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
})

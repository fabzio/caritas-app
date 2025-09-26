import { createFileRoute, redirect } from '@tanstack/react-router'
import { QueryKeys } from '@/shared/constants/query-keys'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: async ({ context: { authClient, queryClient }, location }) => {
    const { data, error } = await queryClient.fetchQuery({
      queryKey: [QueryKeys.SESSION],
      queryFn: () => authClient.getSession(),
    })

    if (error) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: location.href },
      })
    }

    const isAdmin = data?.user?.role?.includes('admin')
    if (!isAdmin) {
      throw redirect({
        to: '/',
        search: { redirect: location.href },
      })
    }
  },
})

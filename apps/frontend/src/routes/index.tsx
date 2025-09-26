import { createFileRoute, redirect } from '@tanstack/react-router'
import { QueryKeys } from '@/shared/constants/query-keys'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context: { queryClient, authClient } }) => {
    const { data } = await queryClient.fetchQuery({
      queryKey: [QueryKeys.SESSION],
      queryFn: () => authClient.getSession(),
    })
    if (!data) throw redirect({ to: '/auth/login', search: { redirect: '/' } })
    else if (data.user.role?.includes('admin')) throw redirect({ to: '/admin' })
    else throw redirect({ to: '/web' })
  },
})

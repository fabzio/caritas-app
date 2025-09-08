import { createFileRoute, redirect } from '@tanstack/react-router'
import { QueryKeys } from '@/shared/constants/query-keys'

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
})

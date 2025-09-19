import { createFileRoute, redirect } from '@tanstack/react-router'
import Login from '@/modules/auth/pages/login'

export const Route = createFileRoute('/auth/login')({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || '/',
  }),
  beforeLoad: async ({ context: { authClient }, search }) => {
    const { data } = await authClient.getSession()
    if (data) {
      throw redirect({
        to: search.redirect,
      })
    }
  },
  component: Login,
})

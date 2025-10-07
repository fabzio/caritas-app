import Login from '@frontend/modules/auth/pages/login'
import { createFileRoute, redirect } from '@tanstack/react-router'

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

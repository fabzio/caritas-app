import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/auth/error')({
  loader: async () => {
    toast.error('Error during authentication. Please try again.')
    throw redirect({
      to: '/auth/register',
    })
  },
})

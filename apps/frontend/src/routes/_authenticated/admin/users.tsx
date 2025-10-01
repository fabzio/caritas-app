import { createFileRoute } from '@tanstack/react-router'
import authClient from '@/lib/authClient'
import User from '@/modules/admin/pages/users'
import { QueryKeys } from '@/shared/constants/query-keys'
import type { Filters } from '@/shared/types/filters'

export const Route = createFileRoute('/_authenticated/admin/users')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData({
      queryKey: [QueryKeys.ADMIN.USERS, []],
      queryFn: async () => {
        const { data, error } = await authClient.admin.listUsers({
          query: {
            limit: 10,
            offset: 0,
          },
        })
        if (error) throw error
        return data || { members: [], total: 0 }
      },
    }),
  validateSearch: () => ({}) as Filters,
  component: User,
})

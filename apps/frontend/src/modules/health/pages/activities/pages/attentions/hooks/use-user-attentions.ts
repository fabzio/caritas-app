import rpc from '@frontend/lib/rpc'
import { useQuery } from '@tanstack/react-query'

interface UseUserAttentionsParams {
  activityId: string
  userId: string
  searchQuery?: string
}

export const useUserAttentions = ({
  activityId,
  userId,
  searchQuery = '',
}: UseUserAttentionsParams) => {
  return useQuery({
    queryKey: ['user-attentions', activityId, userId, searchQuery],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities[
        'user-attentions'
      ].get({
        query: {
          activityId,
          userId,
          q: searchQuery,
        },
      })

      if (error) throw error
      return data
    },
    enabled: !!activityId && !!userId,
  })
}

export type UserAttentionsResponse = NonNullable<
  ReturnType<typeof useUserAttentions>['data']
>

export type UserAttention = UserAttentionsResponse[number]

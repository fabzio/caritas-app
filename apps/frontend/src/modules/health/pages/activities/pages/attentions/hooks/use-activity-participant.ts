import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

interface UseActivityParticipantParams {
  activityId: string
  userId: string
}

export const useActivityParticipant = ({
  activityId,
  userId,
}: UseActivityParticipantParams) => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ACTIVITIES, activityId, userId],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.participants.get({
        query: {
          activityId,
          q: '',
        },
      })

      if (error) throw error
      const participant = data?.find((p) => p.id === userId)
      return participant || undefined
    },
    enabled: !!activityId && !!userId,
  })
}

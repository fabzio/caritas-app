import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

interface UseActivityParticipantsParams {
  activityId: string
  searchQuery?: string
}

export const useActivityParticipants = ({
  activityId,
  searchQuery = '',
}: UseActivityParticipantsParams) => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ACTIVITIES, activityId, searchQuery],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.participants.get({
        query: {
          activityId,
          q: searchQuery,
        },
      })

      if (error) throw error
      return data
    },
    enabled: !!activityId,
  })
}

export type ActivityParticipantResponse = NonNullable<
  ReturnType<typeof useActivityParticipants>['data']
>

export type ActivityParticipant = ActivityParticipantResponse[number]

import db from '@frontend/db'
import { attentions } from '@frontend/db/schema'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'
import { count, max, sum } from 'drizzle-orm'

export const useGetBeneficiaries = () => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ANALITICS.METRIC, 'BENEFICIARIES'],
    queryFn: async () => {
      const sq = db
        .select({
          activityId: attentions.activityId,
          registrations: max(attentions.activityRegistrations).as(
            'registrations',
          ),
          rewarded: max(attentions.activityRewarded).as('rewarded'),
          newParticipants: max(attentions.activityNewParticipants).as(
            'newParticipants',
          ),
          attentions: count(attentions.attentionId).as('attentions'),
        })
        .from(attentions)
        .groupBy(attentions.activityId)
        .as('sq')
      const res = await db
        .select({
          registrations: sum(sq.registrations),
          rewarded: sum(sq.rewarded),
          newParticipants: sum(sq.newParticipants),
          attentions: sum(sq.attentions),
        })
        .from(sq)
      return res[0]
    },
  })
}

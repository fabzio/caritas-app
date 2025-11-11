import db from '@frontend/db'
import { attentions } from '@frontend/db/schema'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'
import { count } from 'drizzle-orm'

export const useRegionDistribution = () => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ANALITICS.METRIC, 'REGION_DISTRIBUTION'],
    queryFn: async () => {
      const sq = db
        .selectDistinct({
          id: attentions.activityId,
          name: attentions.activityName,
          region: attentions.activityRegion,
        })
        .from(attentions)
        .as('sq')

      return await db
        .select({
          region: sq.region,
          total: count(sq.id),
        })
        .from(sq)
        .groupBy(sq.region)
    },
  })
}

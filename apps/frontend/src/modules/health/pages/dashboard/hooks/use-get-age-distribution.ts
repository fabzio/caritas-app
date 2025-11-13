import db from '@frontend/db'
import { attentions } from '@frontend/db/schema'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'
import { countDistinct, sql } from 'drizzle-orm'

export const useGetAgeDistribution = () => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ANALITICS.METRIC, 'AGE_DISTRIBUTION'],
    queryFn: async () => {
      const ageGroup = sql<string>`
        case
          when ${attentions.patientAge} < 18 then '<18'
          when ${attentions.patientAge} between 18 and 64 then '18-64'
          else '65+'
        end
      `
      return db
        .select({
          range: ageGroup.as('range'),
          total: countDistinct(attentions.patientId)
            .as('total')
            .getSQL()
            .mapWith(Number),
        })
        .from(attentions)
        .groupBy(ageGroup)
    },
  })
}

import db from '@frontend/db'
import { attentions } from '@frontend/db/schema'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'
import { countDistinct } from 'drizzle-orm'

export const useGetSexDistribution = () => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ANALITICS.METRIC, 'SEX'],
    queryFn: async () => {
      return await db
        .select({
          sex: attentions.patientSex
            .getSQL()
            .as('sex')
            .getSQL()
            .mapWith(String),
          total: countDistinct(attentions.patientId).as('total'),
        })
        .from(attentions)
        .groupBy(attentions.patientSex)
    },
  })
}

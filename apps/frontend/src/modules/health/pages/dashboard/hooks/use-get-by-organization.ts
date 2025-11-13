import db from '@frontend/db'
import { attentions } from '@frontend/db/schema'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'
import { count, desc } from 'drizzle-orm'

export const useGetByOrganization = () => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ANALITICS.METRIC, 'BY_ORGANIZATION'],
    queryFn: async () => {
      const res = await db
        .select({
          organization: attentions.alliedOrganization,
          attentions: count(attentions.attentionId),
        })
        .from(attentions)
        .groupBy(attentions.alliedOrganization)
        .orderBy(desc(count(attentions.attentionId)))
      return res
    },
  })
}

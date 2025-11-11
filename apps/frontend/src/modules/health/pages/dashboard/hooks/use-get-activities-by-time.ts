import db from '@frontend/db'
import { attentions } from '@frontend/db/schema'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'
import { sql } from 'drizzle-orm'

export const useGetActivitiesByTime = (
  granularity: 'week' | 'month' | 'quarter' | 'year',
) => {
  return useQuery({
    queryKey: [
      QueryKeys.HEALTH.ANALITICS.METRIC,
      'ACTIVITIES_BY_TIME',
      granularity,
    ],
    queryFn: async () => {
      const sq = db
        .selectDistinct({
          activityId: attentions.activityId.getSQL().as('activityId'),
          activityType: attentions.activityType.getSQL().as('activityType'),
          activityDate: attentions.activityDate.getSQL().as('activityDate'),
          activityName: attentions.activityName.getSQL().as('activityName'),
        })
        .from(attentions)
        .as('sq')

      const truncatedDate =
        granularity === 'week'
          ? sql`date_trunc('week', ${sq.activityDate})`
          : granularity === 'month'
            ? sql`date_trunc('month', ${sq.activityDate})`
            : granularity === 'quarter'
              ? sql`date_trunc('quarter', ${sq.activityDate})`
              : sql`date_trunc('year', ${sq.activityDate})`

      const formattedLabel =
        granularity === 'week'
          ? sql`to_char(${truncatedDate}, 'FMDD') || '-' || to_char(${truncatedDate} + interval '6 days', 'FMDD Mon')`
          : granularity === 'month'
            ? sql`to_char(${truncatedDate}, 'FMMon')`
            : granularity === 'quarter'
              ? sql`to_char(${truncatedDate}, 'FMMon') || ' - ' || to_char(${truncatedDate} + interval '2 months', 'FMMon')`
              : sql`to_char(${truncatedDate}, 'YYYY')`

      return db
        .select({
          date: formattedLabel.as('date'),
          campaigns:
            sql<number>`SUM(CASE WHEN ${sq.activityType} = 'Campaña' THEN 1 ELSE 0 END)`.as(
              'campaigns',
            ),
          talks:
            sql<number>`SUM(CASE WHEN ${sq.activityType} = 'Charla' THEN 1 ELSE 0 END)`.as(
              'talks',
            ),
        })
        .from(sq)
        .groupBy(truncatedDate, formattedLabel)
        .orderBy(truncatedDate)
    },
  })
}

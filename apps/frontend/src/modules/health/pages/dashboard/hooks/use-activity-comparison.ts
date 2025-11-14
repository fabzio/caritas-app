import db from '@frontend/db'
import { attentions } from '@frontend/db/schema'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'
import { count, sql } from 'drizzle-orm'

export const useActivityComparison = (
  groupby?: 'speciality' | 'organization',
) => {
  const mapBy = {
    speciality: attentions.speciality,
    organization: attentions.alliedOrganization,
  }
  return useQuery({
    queryKey: [
      QueryKeys.HEALTH.ANALITICS.METRIC,
      'ACTIVITY_COMPARISON',
      groupby ?? 'none',
    ],
    queryFn: async () => {
      const groupBy = groupby
        ? [attentions.activityId, attentions.activityName, mapBy[groupby]]
        : [attentions.activityId, attentions.activityName]
      const res = await db
        .select({
          activity: sql<string>`concat('#', ${attentions.activityId}, ' ', ${attentions.activityName})`,
          ...(groupby ? { group: mapBy[groupby] } : {}),
          total: count(attentions.attentionId),
        })
        .from(attentions)
        .groupBy(...groupBy)
      if (!groupby) {
        const aggregated = res.reduce<Record<string, number>>(
          (acc, { activity, total }) => {
            if (typeof activity !== 'string') {
              return acc
            }
            acc[activity] = (acc[activity] ?? 0) + Number(total)
            return acc
          },
          {},
        )
        return Object.entries(aggregated).map(([activity, total]) => ({
          activity,
          total,
        })) as {
          activity: string
          total: number
        }[]
      }
      const groups = new Set<string>()
      const aggregated = res.reduce<Record<string, Record<string, number>>>(
        (acc, { activity, group, total }) => {
          if (typeof activity !== 'string' || typeof group !== 'string') {
            return acc
          }
          groups.add(group)
          const groupTotals = acc[activity] ?? {}
          groupTotals[group] = (groupTotals[group] ?? 0) + Number(total)
          acc[activity] = groupTotals
          return acc
        },
        {},
      )
      const groupKeys = Array.from(groups).sort()
      return Object.entries(aggregated).map(([activity, groupTotals]) => {
        const totals = groupKeys.reduce<Record<string, number>>((acc, key) => {
          acc[key] = groupTotals[key] ?? 0
          return acc
        }, {})
        return {
          activity,
          ...totals,
        }
      }) as {
        activity: string
        [key: string]: number | string
      }[]
    },
  })
}

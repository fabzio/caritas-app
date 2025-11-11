import db from '@frontend/db'
import { migrate } from '@frontend/db/migrate'
import { attentions } from '@frontend/db/schema'
import { useFilters } from '@frontend/hooks/use-filters'
import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export const useSyncDb = () => {
  const queryClient = useQueryClient()
  const { filters } = useFilters('/_authenticated/health/')
  const { data: _, ...rest } = useQuery({
    queryKey: [QueryKeys.HEALTH.ANALITICS.GENERAL, filters],
    queryFn: async () => {
      const { data, error } = await rpc.health.analytics.attentions.get({
        query: {
          activityIds: filters.activityId,
          startDate: filters.startDate,
          endDate: filters.endDate,
          sex: filters.sex,
          allied: filters.allied,
          region: filters.region,
        },
      })
      if (error) throw error

      const exists =
        (
          await db.execute(
            "SELECT * FROM information_schema.tables WHERE table_name = 'attentions'",
          )
        ).rows.length > 0
      if (!exists) await migrate()
      await db.delete(attentions)
      await db.insert(attentions).values(data)
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.HEALTH.ANALITICS.METRIC],
      })
      return data
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
  return rest
}

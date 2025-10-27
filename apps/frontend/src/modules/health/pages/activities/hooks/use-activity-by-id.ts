import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'

export const useActivityById = (id: string) => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.HEALTH.ACTIVITY, id],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities({ id }).get()

      if (error) {
        throw new Error(error.value as string)
      }

      return data
    },
  })
}

export const useActivityDetailById = (id: string) => {
  return useSuspenseQuery({
    queryKey: [QueryKeys.HEALTH.ACTIVITY, id],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.detail({ id }).get()

      if (error) {
        throw new Error(error.value as string)
      }

      return data
    },
  })
}

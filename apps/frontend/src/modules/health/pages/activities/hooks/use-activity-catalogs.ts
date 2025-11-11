import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export const useActivityTypes = () => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ACTIVITY.TYPES],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.types.get()
      if (error) throw error
      return data
    },
  })
}

export const useActivityStatuses = () => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.ACTIVITY.STATUSES],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.statuses.get()
      if (error) throw error
      return data
    },
  })
}

export const useAllies = () => {
  return useQuery({
    queryKey: [QueryKeys.ADMIN.ALLIES],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.allies.get()
      if (error) throw error
      return data
    },
  })
}

export const useSpecialities = () => {
  return useQuery({
    queryKey: [QueryKeys.HEALTH.SPECIALITIES, 'ALL'],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.specialities.get()
      if (error) throw error
      return data
    },
  })
}

import rpc from '@frontend/lib/rpc'
import { useQuery } from '@tanstack/react-query'

export const useActivityTypes = () => {
  return useQuery({
    queryKey: ['activity-types'],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.types.get()
      if (error) throw error
      return data
    },
  })
}

export const useActivityStatuses = () => {
  return useQuery({
    queryKey: ['activity-statuses'],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.statuses.get()
      if (error) throw error
      return data
    },
  })
}

export const useAllies = () => {
  return useQuery({
    queryKey: ['activity-allies'],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.allies.get()
      if (error) throw error
      return data
    },
  })
}

export const useSpecialities = () => {
  return useQuery({
    queryKey: ['activity-specialities'],
    queryFn: async () => {
      const { data, error } = await rpc.health.activities.specialities.get()
      if (error) throw error
      return data
    },
  })
}

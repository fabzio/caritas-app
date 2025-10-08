import authClient from '@frontend/lib/authClient'
import { useQuery } from '@tanstack/react-query'

export const useListTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await authClient.organization.listTeams()
      if (error) throw error
      return data
    },
  })
}

import authClient from '@frontend/lib/authClient'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export const useListTeams = () => {
  return useQuery({
    queryKey: [QueryKeys.ADMIN.ORG_TEAMS],
    queryFn: async () => {
      const { data, error } = await authClient.organization.listTeams()
      if (error) throw error
      return data
    },
  })
}

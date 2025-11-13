import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

type ApplicationStatus = {
  hasApplied: boolean
  status?: 'pending' | 'accepted' | 'rejected'
  applicationDate?: string
}

export const useCheckApplicationStatus = (
  scholarshipId: number,
  enabled = true,
) => {
  return useQuery<ApplicationStatus>({
    queryKey: [
      QueryKeys.EDUCATION.SCHOLARSHIP_APPLICATION,
      'check',
      scholarshipId,
    ],
    queryFn: async () => {
      if (!scholarshipId || scholarshipId <= 0) {
        throw new Error('ID de beca inválido')
      }
      const { data, error } = await rpc.education.scholarship.application
        .check({ scholarshipId: scholarshipId.toString() })
        .get()
      if (error) {
        throw error
      }
      return data as ApplicationStatus
    },
    enabled: enabled && Boolean(scholarshipId) && scholarshipId > 0,
  })
}

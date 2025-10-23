import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export type Applicant = {
  id: number
  name: string
  email: string
  applicationDate: string
  status: 'pending' | 'accepted' | 'rejected'
}

export function useGetApplicants(scholarshipId: number) {
  return useQuery<Applicant[]>({
    queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_APPLICATION, scholarshipId],
    queryFn: async () => {
      if (!scholarshipId || scholarshipId <= 0) {
        throw new Error('ID de beca inválido')
      }
      const { data, error } = await rpc.education.scholarship
        .application({ scholarshipId: scholarshipId.toString() })
        .get()
      if (error) {
        throw error
      }
      return data.map(
        (applicant: {
          id: number
          userName: string
          userEmail: string
          applicationDate: string
          status: 'pending' | 'accepted' | 'rejected'
        }) => ({
          id: applicant.id,
          name: applicant.userName,
          email: applicant.userEmail,
          applicationDate: applicant.applicationDate,
          status: applicant.status,
        }),
      )
    },
    enabled: Boolean(scholarshipId) && scholarshipId > 0,
  })
}

import { useQuery } from '@tanstack/react-query'
import rpc from '@/lib/rpc'
import { QueryKeys } from '@/shared/constants/query-keys'

export type Applicant = {
  id: number
  name: string
  email: string
  applicationDate: string
  status: 'pending' | 'accepted' | 'rejected'
}

export function useGetApplicants(scholarshipId: number) {
  return useQuery<Applicant[]>({
    queryKey: [QueryKeys.SCHOLARSHIP_APPLICATION, scholarshipId],
    queryFn: async () => {
      if (!scholarshipId || scholarshipId <= 0) {
        throw new Error('Invalid scholarshipId')
      }
      const { data, error } = await rpc.education['scholarship-application']({
        scholarship_id: scholarshipId.toString(),
      }).get()
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

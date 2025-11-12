import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export type AcceptedStudent = {
  id: string
  name: string
  email: string
  applicationDate: string
  reviewDate: string
}

export type AcceptedStudentsData = {
  data: AcceptedStudent[]
}

export function useGetAcceptedStudents(scholarshipId: number, name?: string) {
  return useQuery({
    queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP_ACCEPTED, scholarshipId, name],
    queryFn: async () => {
      if (!scholarshipId || scholarshipId <= 0) {
        throw new Error('ID de beca inválido')
      }
      const { data, error } = await rpc.education.scholarship.application[
        'accepted-users'
      ].get({
        query: { scholarshipId, name },
      })
      if (error) {
        throw error
      }
      return data as AcceptedStudentsData
    },
    enabled: Boolean(scholarshipId) && scholarshipId > 0,
  })
}

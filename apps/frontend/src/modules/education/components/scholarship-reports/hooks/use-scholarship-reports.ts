import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export type ScholarshipReport = {
  id: number
  scholarship: {
    id: number
    name: string
  }
  student: {
    id: string
    name: string
    email: string
    phone: string
  }
  cause: 'absence' | 'performance' | 'other'
  causeDetail?: string
  reason: {
    id?: number
    name?: string
  }
  reasonDetail?: string
  reportedBy: {
    id?: string
    name?: string
    email?: string
  }
  createdAt: string
  updatedAt: string
}

export type ScholarshipReportsResponse = {
  data: ScholarshipReport[]
  page: number
  pageSize: number
  total: number
  pageCount: number
}

type UseScholarshipReportsParams = {
  scholarshipId?: number
  search?: string
  page?: number
  pageSize?: number
}

export const useScholarshipReports = ({
  scholarshipId,
  search,
  page = 1,
  pageSize = 10,
}: UseScholarshipReportsParams) => {
  return useQuery({
    queryKey: [
      QueryKeys.EDUCATION.SCHOLARSHIP_REPORTS,
      { scholarshipId, search, page, pageSize },
    ],
    enabled: Boolean(scholarshipId),
    queryFn: async () => {
      const { data, error } = await rpc.education.scholarship.report.get({
        query: {
          scholarshipId,
          search,
          page,
          pageSize,
        },
      })
      if (error) throw error
      return data as ScholarshipReportsResponse
    },
  })
}

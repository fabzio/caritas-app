import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQuery } from '@tanstack/react-query'

export type Scholarship = {
  id: number
  name: string
  description: string
  requirements: string
  startDate: string
  endDate: string
  type: 'ML' | 'PL'
  organizationId: string
  vacancies: number
  active: boolean
  createdBy: string
  organization?: {
    id: string
    name: string
  }
}

export type ScholarshipPaginated = NonNullable<
  Awaited<ReturnType<typeof rpc.education.scholarship.get>>
>['data']

// hook para hacer fetch all de scholarships
// tiene filtrado por nombre y paginación
const useGetScholarship = (name?: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP, { name, page, pageSize }],
    queryFn: async () => {
      const res = await rpc.education.scholarship.get({
        query: { name, page, pageSize },
      })
      if (res.error) throw res.error
      return res.data
    },
  })
}
export default useGetScholarship

import rpc from '@frontend/lib/rpc'
import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

const useScholarshipDetail = () => {
  const { scholarshipId } = useParams({
    from: '/_authenticated/organization/education/scholarship/$scholarshipId/view',
  })
  return useSuspenseQuery({
    queryKey: [QueryKeys.EDUCATION.SCHOLARSHIP, scholarshipId],
    queryFn: async () => {
      const { data, error } = await rpc.education
        .scholarship({
          id: scholarshipId,
        })
        .get()
      if (error) throw error
      return data
    },
  })
}

export default useScholarshipDetail

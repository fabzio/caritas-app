import { QueryKeys } from '@frontend/shared/constants/query-keys'
import { useQueryClient } from '@tanstack/react-query'
import type { Scholarship, ScholarshipPaginated } from './use-get-scholarship'

const useScholarshipStore = () => {
  const queryClient = useQueryClient()

  const getScholarshipById = (id: number): Scholarship | undefined => {
    const queries = queryClient.getQueriesData<ScholarshipPaginated>({
      queryKey: [QueryKeys.SCHOLARSHIP],
    })

    for (const [, data] of queries) {
      if (!data?.data) continue
      const scholarship = data.data.find((s) => s.id === id)
      if (scholarship) return scholarship
    }

    return undefined
  }

  return { getScholarshipById }
}

export default useScholarshipStore

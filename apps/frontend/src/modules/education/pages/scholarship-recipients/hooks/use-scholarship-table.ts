import { useFilters } from '@frontend/hooks/use-filters'
import { sortByToState } from '@frontend/shared/utils/sort-by-to-state'
import { useMemo } from 'react'
import { scholarshipRecipientTableColumns } from '../components/recipient-column'
import { useScholarshipRecipients } from './use-scholarship'

export const useScholarshipRecipientTable = () => {
  const { filters, setFilters } = useFilters(
    '/_authenticated/education/recipients/',
  )
  const { data: response, isLoading } = useScholarshipRecipients({
    currentPage: filters.pageIndex,
    pageSize: filters.pageSize,
    filters: filters,
  })

  const sortingState = sortByToState(filters.sortBy)
  const paginationState = {
    pageIndex: filters.pageIndex ?? 1,
    pageSize: filters.pageSize ?? 10,
  }

  const columns = useMemo(() => scholarshipRecipientTableColumns, [])

  return {
    isLoading,
    data: response?.data,
    pagination: response
      ? {
          total: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          pageSize: response.limit,
        }
      : undefined,
    setFilters,
    columns,
    sortingState,
    paginationState,
    filters,
  }
}

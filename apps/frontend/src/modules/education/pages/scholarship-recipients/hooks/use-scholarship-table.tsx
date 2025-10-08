import { useMemo } from 'react'
import { useFilters } from '@/hooks/use-filters'
import { sortByToState } from '@/shared/utils/sort-by-to-state'
import { scholarshipRecipientTableColumns } from '../components/recipient-column'
import { useScholarshipRecipients } from './use-scholarship'

export const useScholarshipRecipientTable = () => {
  const { filters, setFilters } = useFilters(
    '/_authenticated/education/recipients/',
  )
  const { data } = useScholarshipRecipients({
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
    data: data?.data,
    pagination: data
      ? {
          total: data.total,
          totalPages: data.totalPages,
          currentPage: data.page,
          pageSize: data.limit,
        }
      : undefined,
    setFilters,
    columns,
    sortingState,
    paginationState,
  }
}

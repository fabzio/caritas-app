import { useFilters } from '@frontend/hooks/use-filters'
import { sortByToState } from '@frontend/shared/utils/sort-by-to-state'
import { useMemo } from 'react'
import { scholarshipTableColumns } from '../components/columns'
import useGetScholarship from './use-get-scholarship'

export const useScholarshipTable = () => {
  const { filters, setFilters } = useFilters(
    '/_authenticated/education/scholarship/',
  )
  const {
    data: response,
    isLoading,
    isError,
  } = useGetScholarship(filters.name, filters.pageIndex, filters.pageSize)

  const sortingState = sortByToState(filters.sortBy)
  const paginationState = {
    pageIndex: filters.pageIndex ?? 1,
    pageSize: filters.pageSize ?? 10,
  }

  const columns = useMemo(() => scholarshipTableColumns, [])

  return {
    data: response?.data,
    pagination: response
      ? {
          total: response.total,
          totalPages: response.pageCount,
          currentPage: response.page,
          pageSize: response.pageSize,
        }
      : undefined,
    filters,
    setFilters,
    columns,
    sortingState,
    paginationState,
    isLoading,
    isError,
  }
}

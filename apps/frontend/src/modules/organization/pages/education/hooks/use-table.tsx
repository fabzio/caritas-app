import { useFilters } from '@frontend/hooks/use-filters'
import { scholarshipTableColumns } from '@frontend/modules/education/pages/scholarship/components/columns'
import useGetScholarship from '@frontend/modules/education/pages/scholarship/hooks/use-get-scholarship'
import { sortByToState } from '@frontend/shared/utils/sort-by-to-state'
import { useMemo } from 'react'
export const useScholarshipTable = () => {
  const { filters, setFilters } = useFilters(
    '/_authenticated/organization/education/scholarship/',
  )
  const {
    data: response,
    isLoading,
    isError,
  } = useGetScholarship(
    filters.name,
    filters.pageIndex,
    filters.pageSize,
    filters.active,
  )

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

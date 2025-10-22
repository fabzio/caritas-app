import { useFilters } from '@frontend/hooks/use-filters'
import { sortByToState } from '@frontend/shared/utils/sort-by-to-state'
import { useMemo } from 'react'
import { specialityTableColumns } from '../components/columns'
import { useGetSpecialities } from './use-get-specialities'

export const useSpecialityTable = () => {
  const { filters, setFilters } = useFilters(
    '/_authenticated/health/specialities/',
  )
  const { data: response } = useGetSpecialities({
    currentPage: filters.pageIndex,
    pageSize: filters.pageSize,
    filters: filters,
  })

  const sortingState = sortByToState(filters.sortBy)
  const paginationState = {
    pageIndex: filters.pageIndex ?? 1,
    pageSize: filters.pageSize ?? 10,
  }

  const columns = useMemo(() => specialityTableColumns, [])

  return {
    data: response?.data,
    pagination: response
      ? {
          total: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          pageSize: response.limit,
        }
      : undefined,
    filters,
    setFilters,
    columns,
    sortingState,
    paginationState,
  }
}
